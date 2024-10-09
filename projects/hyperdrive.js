const ethers = require("ethers");
const sdk = require("@defillama/sdk");
const { sumUnknownTokens } = require('./helper/unknownTokens');

const MAINNET_REGISTRY_ADDRESS = "0xbe082293b646cb619a638d29e8eff7cf2f46aa3a";
const GNOSIS_REGISTRY_ADDRESS = "0x666fa9ef9bca174a042c4c306b23ba8ee0c59666"
const FUTURE_REGISTRY_ADDRESS = "0x6668310631Ad5a5ac92dC9549353a5BaaE16C666"
const NAME_ABI = "function name() view returns (string)";
const GET_POOL_CONFIG_ABI = "function getPoolConfig() view returns (tuple(address baseToken, address vaultSharesToken, address linkerFactory, bytes32 linkerCodeHash, uint256 initialVaultSharePrice, uint256 minimumShareReserves, uint256 minimumTransactionAmount, uint256 circuitBreakerDelta, uint256 positionDuration, uint256 checkpointDuration, uint256 timeStretch, address governance, address feeCollector, address sweepCollector, address checkpointRewarder, tuple(uint256 curve, uint256 flat, uint256 governanceLP, uint256 governanceZombie) fees))";
const GET_NUMBER_OF_INSTANCES_ABI = "function getNumberOfInstances() view returns (uint256)";
const GET_INSTANCES_IN_RANGE_ABI = "function getInstancesInRange(uint256 _startIndex, uint256 _endIndex) view returns (address[] memory instances)";
const POSITION_ABI = "function position(bytes32 id, address user) view returns (tuple(uint256 supplyShares, uint128 borrowShares, uint128 collateral))";
const VAULT_ABI = "function vault() external view returns (address)";
const COLLATERAL_TOKEN_ABI = "function collateralToken() external view returns (address)";
const ORACLE_ABI = "function oracle() external view returns (address)";
const IRM_ABI = "function irm() external view returns (address)";
const LLTV_ABI = "function lltv() external view returns (uint256)";

async function callWithRetry(apiCall, retries = 5, initialTimeout = 300) {
  for (let i = 0; i < retries; i++) {
    try {
      const timeout = initialTimeout * Math.pow(2, i); // Exponential backoff
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("API call timeout")), timeout)
      );
      const result = await Promise.race([apiCall(), timeoutPromise]);
      return result;
    } catch (error) {
      console.log(`callWithRetry error. Retry number: ${i + 1}/${retries}. Error:\n`, error);
      if (i === retries - 1) throw error;
    }
  }
}

async function getPoolDetails(api, poolAddress, block) {
  const name = await callWithRetry(() => api.call({ target: poolAddress, abi: NAME_ABI, block: block }));
  const config = await callWithRetry(() => api.call({ target: poolAddress, abi: GET_POOL_CONFIG_ABI, block: block }));

  let vaultSharesBalance = 0;
  console.log("name: ", name)
  if (name.includes("Morpho")) {
    console.log("Morpho");
    // const vault = await api.call({ target: poolAddress, abi: VAULT_ABI });
    const vault = await callWithRetry(() => api.call({ target: poolAddress, abi: VAULT_ABI, block: block }));
    console.log("vault: ", vault)
    const collateralToken = await callWithRetry(() => api.call({ target: poolAddress, abi: COLLATERAL_TOKEN_ABI, block: block }));
    console.log("collateralToken: ", collateralToken)
    const oracle = await callWithRetry(() => api.call({ target: poolAddress, abi: ORACLE_ABI, block: block }));
    console.log("oracle: ", oracle)
    const irm = await callWithRetry(() => api.call({ target: poolAddress, abi: IRM_ABI, block: block }));
    console.log("irm: ", irm)
    const lltv = await callWithRetry(() => api.call({ target: poolAddress, abi: LLTV_ABI, block: block }));
    console.log("lltv: ", lltv)

    // const abiCoder = new ethers.utils.AbiCoder();
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const packedIds = abiCoder.encode(
      ['address', 'address', 'address', 'address', 'uint256'],
      [config.baseToken, collateralToken, oracle, irm, lltv]
    );
    console.log("packedIds: ", packedIds)
    const morphoMarketId = ethers.keccak256(packedIds);
    console.log("morphoMarketId", morphoMarketId)
    const position = await api.call({ target: vault, abi: POSITION_ABI, params: [morphoMarketId, poolAddress], block: block });
    console.log("position: ", position)
    vaultSharesBalance = position[0]/1e6;
    tokenSymbol = await api.call({ target: config.baseToken, abi: 'erc20:symbol' })
    tokenAddress = config.baseToken
  } else if (config.vaultSharesToken !== "0x0000000000000000000000000000000000000000") {
    vaultSharesBalance = await api.call({target: config.vaultSharesToken, abi: 'erc20:balanceOf', params: [poolAddress], block: block});
    tokenSymbol = await api.call({ target: config.vaultSharesToken, abi: 'erc20:symbol' })
    tokenAddress = config.vaultSharesToken
  }
  console.log("  ", tokenSymbol, vaultSharesBalance)
  console.log("   tokenAddress: ", tokenAddress)

  return { config, name, vaultSharesBalance };
};

async function tvl(api, chain, registry) {
  // we lock in the block we're querying for here, to make sure all our pools are consistent
  const block = api.block ?? await api.getBlock();
  console.log("block: ", block);

  const numberOfInstances = await api.call({target: registry,abi: GET_NUMBER_OF_INSTANCES_ABI, block: block});
  const instanceList = await api.call({ target: registry, abi: GET_INSTANCES_IN_RANGE_ABI, params: [0, numberOfInstances], block: block });

  for (const poolAddress of instanceList) {
  // first item only
  // item = 10
  // for (const poolAddress of instanceList.slice(item, item+1)) {
    const poolDetails = await getPoolDetails(api, poolAddress, block);
    const tokenAddress = poolDetails.config.vaultSharesToken === "0x0000000000000000000000000000000000000000" 
      ? poolDetails.config.baseToken 
      : poolDetails.config.vaultSharesToken;

    api.add(tokenAddress, poolDetails.vaultSharesBalance);
  }
  // return sumUnknownTokens({ api, resolveLP: true, useDefaultCoreAssets: true, })
}

module.exports = {
  ethereum: { tvl: async (api) => await tvl(api, "ethereum", MAINNET_REGISTRY_ADDRESS) },
  xdai: { tvl: async (api) => await tvl(api, "xdai", GNOSIS_REGISTRY_ADDRESS) },
  base: { tvl: async (api) => await tvl(api, "base", FUTURE_REGISTRY_ADDRESS) },
  linea: { tvl: async (api) => await tvl(api, "linea", FUTURE_REGISTRY_ADDRESS) },
};