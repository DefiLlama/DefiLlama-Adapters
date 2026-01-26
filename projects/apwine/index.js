const abi = {
    "registry_futureVaultCount": "uint256:futureVaultCount",
    "registry_getFutureVaultAt": "function getFutureVaultAt(uint256 _index) returns (address futureVault)",
    "registry_getIBTAddress": "address:getIBTAddress",
    "ammregistry_getFutureAMMPool": "function getFutureAMMPool(address _futureVaultAddress ) returns (address _futureAMMPoolAddress )",
    "futurevault_STAKED_TOKEN": "address:STAKED_TOKEN",
    "futurevault_getPTAddress": "address:getPTAddress",
    "ammPool_getFYTAddress": "address:getFYTAddress",
    "ammPool_getFutureAddress": "address:getFutureAddress",
    "ammPool_getIBTAddress": "address:getIBTAddress",
    "ammPool_getPTAddress": "address:getPTAddress",
    "ammPool_getPoolTokenAddress": "address:getPoolTokenAddress",
    "ammPool_getUnderlyingOfIBTAddress": "address:getUnderlyingOfIBTAddress",
    "ammPool_getPairWithID_BAD_OUTPUT_ABI": "function getPairWithID(uint256 id) returns (address tokenAddress , uint256[2] weights , uint256[2] balances , bool liquidityIsInitialized )"
  };const { pool2s } = require("../helper/pool2.js")

// Same registry addresses for polygon and mainnet
const registry = '0x72d15eae2cd729d8f2e41b1328311f3e275612b9'
const AMMregistry = '0x6646A35e74e35585B0B02e5190445A324E5D4D01'

// Pool2 - APW-XXX LP staked
const APW_WETH_cometh = '0x70797fc5b1c04541113b5ac20ea05cb390392e30'
const APW_MUST_cometh = '0x174f902194fce92ef3a51079b531f1e5073de335'
const APW_WETH_cometh_staking = '0x4e2114f7fa11dc0765ddd51ad98b6624c3bf1908'
const APW_MUST_cometh_staking = '0xb7ae78f49ac9bd9388109a4c5f53c6b79be4deda'

const tvl = async (api) => {
  const vaults = await api.fetchList({ lengthAbi: abi.registry_futureVaultCount, itemAbi: abi.registry_getFutureVaultAt, target: registry })
  const btAddresses = await api.multiCall({ abi: abi.registry_getIBTAddress, calls: vaults })
  const ammPools = await api.multiCall({ abi: abi.ammregistry_getFutureAMMPool, calls: vaults, target: AMMregistry })
  const ammPoolsUnderlying = await api.multiCall({ abi: abi.ammPool_getUnderlyingOfIBTAddress, calls: ammPools })

  return api.sumTokens({ tokensAndOwners2: [btAddresses.concat(ammPoolsUnderlying), vaults.concat(ammPools)] })
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
    //staking: staking(veAPW, APW), 
  },
  polygon: {
    tvl,
    pool2: pool2s([APW_WETH_cometh_staking, APW_MUST_cometh_staking], [APW_WETH_cometh, APW_MUST_cometh])
  },
  methodology: `Use the registry to retrieve futureVaults, and get for each vault the IBT which is the token that this vault holds - the user locked collateral`,
  hallmarks: [
    [1677798000, "Announcement of V1 Retirement"]
  ],
}
