const ethers = require("ethers");
const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");

const HYPERDRIVE_REGISTRY_ADDRESS = "0xbe082293b646cb619a638d29e8eff7cf2f46aa3a";
const NAME_ABI = "function name() view returns (string)";
const GET_POOL_CONFIG_ABI = "function getPoolConfig() view returns (tuple(address baseToken, address vaultSharesToken, address linkerFactory, bytes32 linkerCodeHash, uint256 initialVaultSharePrice, uint256 minimumShareReserves, uint256 minimumTransactionAmount, uint256 circuitBreakerDelta, uint256 positionDuration, uint256 checkpointDuration, uint256 timeStretch, address governance, address feeCollector, address sweepCollector, address checkpointRewarder, tuple(uint256 curve, uint256 flat, uint256 governanceLP, uint256 governanceZombie) fees))";
const GET_POOL_INFO_ABI = "function getPoolInfo() view returns (tuple(uint256 shareReserves, int256 shareAdjustment, uint256 zombieBaseProceeds, uint256 zombieShareReserves, uint256 bondReserves, uint256 lpTotalSupply, uint256 vaultSharePrice, uint256 longsOutstanding, uint256 longAverageMaturityTime, uint256 shortsOutstanding, uint256 shortAverageMaturityTime, uint256 withdrawalSharesReadyToWithdraw, uint256 withdrawalSharesProceeds, uint256 lpSharePrice, uint256 longExposure))";
const GET_NUMBER_OF_INSTANCES_ABI = "function getNumberOfInstances() view returns (uint256)";
const GET_INSTANCES_IN_RANGE_ABI = "function getInstancesInRange(uint256 _startIndex, uint256 _endIndex) view returns (address[] memory instances)";
const POSITION_ABI = "function position(bytes32 id, address user) view returns (tuple(uint256 supplyShares, uint128 borrowShares, uint128 collateral))";
const VAULT_ABI = "function vault() external view returns (address)";
const COLLATERAL_TOKEN_ABI = "function collateralToken() external view returns (address)";
const ORACLE_ABI = "function oracle() external view returns (address)";
const IRM_ABI = "function irm() external view returns (address)";
const LLTV_ABI = "function lltv() external view returns (uint256)";

module.exports = {
    ethereum: { tvl }
  };

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
  const name = await api.call({ target: poolAddress, abi: NAME_ABI, block: block });
  const config = await api.call({ target: poolAddress, abi: GET_POOL_CONFIG_ABI, block: block });
  const info = await api.call({ target: poolAddress, abi: GET_POOL_INFO_ABI, block: block });

  let baseTokenBalance;
  if (config.baseToken === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
    baseTokenBalance = await callWithRetry(() => sdk.api.eth.getBalance({ target: poolAddress, block: block }));
    console.log("baseTokenBalance: ", baseTokenBalance);
  } else {
    baseTokenBalance = await callWithRetry(() => api.call({target: config.baseToken, abi: 'erc20:balanceOf', params: [poolAddress], block: block}));
    console.log("baseTokenBalance: ", baseTokenBalance);
  }

  let vaultSharesBalance = 0;
  console.log("name: ", name)
  if (name.includes("Morpho")) {
    console.log("Morpho");
    // const vault = await api.call({ target: poolAddress, abi: VAULT_ABI });
    const vault = await callWithRetry(() => api.call({ target: poolAddress, abi: VAULT_ABI, block: block }));
    console.log("vault: ", vault)
    const collateralToken = await api.call({ target: poolAddress, abi: COLLATERAL_TOKEN_ABI, block: block });
    console.log("collateralToken: ", collateralToken)
    const oracle = await api.call({ target: poolAddress, abi: ORACLE_ABI, block: block });
    console.log("oracle: ", oracle)
    const irm = await api.call({ target: poolAddress, abi: IRM_ABI, block: block });
    console.log("irm: ", irm)
    const lltv = await api.call({ target: poolAddress, abi: LLTV_ABI, block: block });
    console.log("lltv: ", lltv)

    const morphoMarketId = ethers.solidityPackedKeccak256(
      ['address', 'address', 'address', 'address', 'uint256'],
      [config.baseToken, collateralToken, oracle, irm, lltv]
    );

    const position = await api.call({target: vault, abi: POSITION_ABI, params: [morphoMarketId, poolAddress], block: block});
    vaultSharesBalance = position[0];
  } else if (config.vaultSharesToken !== "0x0000000000000000000000000000000000000000") {
    vaultSharesBalance = await api.call({target: config.vaultSharesToken, abi: 'erc20:balanceOf', params: [poolAddress], block: block});
  }

  const shortRewardableTvl = info.shortsOutstanding;
  const lpRewardableTvl = BigNumber(vaultSharesBalance).minus(shortRewardableTvl).toString();

  return { config, info, name, vaultSharesBalance, lpRewardableTvl, shortRewardableTvl, baseTokenBalance };
};

async function tvl(api) {
  const chain = 'ethereum';

  // we lock in the block we're querying for here, to make sure all our pools are consistent
  const block = api.block ?? await api.getBlock();
  console.log("block: ", block);

  const numberOfInstances = await api.call({target: HYPERDRIVE_REGISTRY_ADDRESS,abi: GET_NUMBER_OF_INSTANCES_ABI, block: block});
  const instanceList = await api.call({ target: HYPERDRIVE_REGISTRY_ADDRESS, abi: GET_INSTANCES_IN_RANGE_ABI, params: [0, numberOfInstances], block: block });

  for (const poolAddress of instanceList) {
    const poolDetails = await getPoolDetails(api, poolAddress, block);
    const tokenAddress = poolDetails.config.vaultSharesToken === "0x0000000000000000000000000000000000000000" 
      ? poolDetails.config.baseToken 
      : poolDetails.config.vaultSharesToken;

    api.add(tokenAddress, poolDetails.vaultSharesBalance);
  }
}
