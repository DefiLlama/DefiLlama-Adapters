const { getLogs } = require("../helper/cache/getLogs");

const stargateLpStakingAbi = {
  userInfo:
    "function userInfo( uint256 ,address  ) external view returns (uint256 amount, uint256 rewardDebt)",
};

const stargatePoolAbi = {
  amountLPtoLD:
    "function amountLPtoLD(uint256 _amountLP) external view returns (uint256)",
  token: "function token() external view returns (address)",
};

const getStargateLpValues = async (api, stargateLpWrappers, processedWrappers) => {
  const stargateLpPools = await api.multiCall({
    abi: "address:underlying",
    calls: stargateLpWrappers,
  });

  const stargateStakingContracts = await api.multiCall({
    abi: "address:stakingContract",
    calls: stargateLpWrappers,
  });

  const stargatePoolIds = await api.multiCall({
    abi: "uint256:poolId",
    calls: stargateLpWrappers,
  });

  const stargateLpAmounts = (
    await api.multiCall({
      calls: stargateLpWrappers.map((wrapperAddress, i) => ({
        target: stargateStakingContracts[i],
        params: [stargatePoolIds[i], wrapperAddress],
      })),
      abi: stargateLpStakingAbi.userInfo,
    })
  ).map(([amount]) => amount);

  // find the amount of assets convert from lpAmount
  const convertedAmounts = await api.multiCall({
    calls: stargateLpPools.map((lpPool, i) => ({
      target: lpPool,
      params: [stargateLpAmounts[i]],
    })),
    abi: stargatePoolAbi.amountLPtoLD,
  });

  let baseStargateAssets = await api.multiCall({
    calls: stargateLpPools,
    abi: stargatePoolAbi.token,
  });

  baseStargateAssets.forEach((asset, i) => {
    if (processedWrappers.has(stargateLpWrappers[i])) return;
    api.add(asset, convertedAmounts[i])
    // Mark this wrapper as processed
    processedWrappers.add(stargateLpWrappers[i]);
  });
};

const getCompoundUsdcValues = async (api, cUsdcV3Wrapper, processedWrappers) => {
  const cUsdcV3 = await api.call({
    abi: "address:underlyingComet",
    target: cUsdcV3Wrapper,
  });

  const baseToken = (
    await api.multiCall({
      abi: "address:baseToken",
      calls: [cUsdcV3],
    })
  )[0];

  const wrapperBalance = await api.call({
    abi: "erc20:balanceOf",
    target: cUsdcV3,
    params: [cUsdcV3Wrapper],
  });

  if (!processedWrappers.has(cUsdcV3Wrapper)) {
    api.add(baseToken, wrapperBalance)
    processedWrappers.add(cUsdcV3Wrapper);
  }
};

const _getLogs = async (api, config) => {
  const resLog = (
    await Promise.all(
      config.deployerAddresses.map((deployerAddress) =>
        getLogs({
          api,
          target: deployerAddress,
          topic: "RTokenCreated(address,address,address,address,string)",
          fromBlock: config.fromBlock,
          eventAbi:
            "event RTokenCreated(address indexed main, address indexed rToken, address stRSR, address indexed owner, string version)",
          onlyArgs: true,
        })
      )
    )
  ).flat();
  return resLog;
};

module.exports = {
  getStargateLpValues,
  getCompoundUsdcValues,
  _getLogs,
};
