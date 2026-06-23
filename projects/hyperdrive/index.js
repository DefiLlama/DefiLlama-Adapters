const ethers = require("ethers")
const { nullAddress } = require('../helper/unwrapLPs')

const FUTURE_REGISTRY_ADDRESS = "0x6668310631Ad5a5ac92dC9549353a5BaaE16C666"
const GET_POOL_CONFIG_ABI = "function getPoolConfig() view returns (tuple(address baseToken, address vaultSharesToken, address linkerFactory, bytes32 linkerCodeHash, uint256 initialVaultSharePrice, uint256 minimumShareReserves, uint256 minimumTransactionAmount, uint256 circuitBreakerDelta, uint256 positionDuration, uint256 checkpointDuration, uint256 timeStretch, address governance, address feeCollector, address sweepCollector, address checkpointRewarder, tuple(uint256 curve, uint256 flat, uint256 governanceLP, uint256 governanceZombie) fees))";
const POSITION_ABI = "function position(bytes32 id, address user) view returns (tuple(uint256 supplyShares, uint128 borrowShares, uint128 collateral))";

const config = {
  ethereum: { registry: '0xbe082293b646cb619a638d29e8eff7cf2f46aa3a', },
  xdai: { registry: '0x666fa9ef9bca174a042c4c306b23ba8ee0c59666', },
  base: {},
  linea: {},
}

Object.keys(config).forEach(chain => module.exports[chain] = { tvl })

async function tvl(api) {
  const { registry = FUTURE_REGISTRY_ADDRESS, } = config[api.chain]
  const instances = await api.fetchList({ lengthAbi: 'getNumberOfInstances', itemAbi: 'getInstanceAtIndex', target: registry })
  const vaultNames = await api.multiCall({ abi: 'string:name', calls: instances })
  const vaultConfig = await api.multiCall({ abi: GET_POOL_CONFIG_ABI, calls: instances })
  const vaults = vaultNames.map((name, i) => ({ name, config: vaultConfig[i], address: instances[i] }))
  const morphoVaults = []
  const morphoVaultInfos = []
  const tokensAndOwners = []

  for (const vault of vaults) {
    if (vault.name.includes("Morpho")) {
      morphoVaults.push(vault.address)
      morphoVaultInfos.push(vault)
    } else if (vault.config.vaultSharesToken !== nullAddress) {
      tokensAndOwners.push([vault.config.vaultSharesToken, vault.address])
    } else {
      tokensAndOwners.push([vault.config.baseToken, vault.address])
    }
  }

  const mVaults  = await api.multiCall({  abi: 'address:vault', calls: morphoVaults})
  const mCollaterals = await api.multiCall({  abi: 'address:collateralToken', calls: morphoVaults})
  const mOracles = await api.multiCall({  abi: 'address:oracle', calls: morphoVaults})
  const mIrms = await api.multiCall({  abi: 'address:irm', calls: morphoVaults})
  const mLltvs = await api.multiCall({  abi: 'uint256:lltv', calls: morphoVaults})

  const morphoMarketIds = morphoVaultInfos.map((vault, i) => {
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const packedIds = abiCoder.encode(
      ['address', 'address', 'address', 'address', 'uint256'],
      [vault.config.baseToken, mCollaterals[i], mOracles[i], mIrms[i], mLltvs[i]]
    );
    return ethers.keccak256(packedIds);
  })
  const positionCalls = morphoVaults.map((vault, i) => ({ target: mVaults[i], abi: POSITION_ABI, params: [morphoMarketIds[i], vault], }))
  const positions = await api.multiCall({ calls: positionCalls, abi: POSITION_ABI })
  positions.forEach((position, i) =>  {
    api.add(morphoVaultInfos[i].config.baseToken, position.supplyShares / 1e6)
    api.add(mCollaterals[i], position.borrowShares * -1 / 1e6)
  })

  return api.sumTokens({ tokensAndOwners })
}

module.exports.hallmarks = [
  ['2025-06-17', 'Product is winding down'], //https://x.com/delv_tech/status/1934995962377756801, https://blog.delv.tech/farewell-to-delv/
]