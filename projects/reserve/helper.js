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

const getStargateLpValues = async (
  api,
  stargateLpWrappers,
  processedWrappers
) => {
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
    api.add(asset, convertedAmounts[i]);
    // Mark this wrapper as processed
    processedWrappers.add(stargateLpWrappers[i]);
  });
};

const getCompoundUsdcValues = async (
  api,
  cUsdcV3Wrappers,
  processedWrappers
) => {
  const comets = await api.multiCall({
    abi: "address:underlyingComet",
    calls: cUsdcV3Wrappers,
  });

  const baseTokens = await api.multiCall({
    abi: "address:baseToken",
    calls: comets,
  });

  const wrapperBalances = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: comets.map((x, i) => ({ target: x, params: [cUsdcV3Wrappers[i]] })),
  });

  cUsdcV3Wrappers.forEach((wrapper, i) => {
    if (!processedWrappers.has(wrapper)) {
      api.add(baseTokens[i], wrapperBalances[i]);
      processedWrappers.add(cUsdcV3Wrappers[i]);
    }
  });
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

const unwrapCreamTokens = async (api, tokensAndOwners) => {
  const [balanceOfTokens, exchangeRates, underlyingTokens] = await Promise.all([
    api.multiCall({
      calls: tokensAndOwners.map(t => ({
        target: t[0],
        params: t[1]
      })),
      abi: 'erc20:balanceOf',
    }),
    api.multiCall({
      calls: tokensAndOwners.map(t => ({
        target: t[0],
      })),
      abi: "uint256:exchangeRateStored",
    }),
    api.multiCall({
      calls: tokensAndOwners.map(t => ({
        target: t[0],
      })),
      abi: "address:underlying",
    })
  ])
  balanceOfTokens.forEach((balanceCall, i) => {
    api.add(underlyingTokens[i], balanceCall * exchangeRates[i] / 1e18)
  })
}

const genericUnwrapCvxDeposit = async (api, tokensAndOwners) => {
  if (!tokensAndOwners.length) return;
  const tokens = [...new Set(tokensAndOwners.map((t) => t[0]))];
  const uTokens = await api.multiCall({ abi: "address:curveToken", calls: tokens, permitFailure: true });
  const tokenMapping = {};
  tokens.forEach((token, i) => {
    if (uTokens[i]) {
      tokenMapping[token] = uTokens[i];
    }
  });
  const validTokensAndOwners = tokensAndOwners.filter((t) => tokenMapping[t[0]]);
  const balances = await api.multiCall({
    calls: validTokensAndOwners.map((t) => ({
      target: t[0],
      params: t[1],
    })),
    abi: "erc20:balanceOf",
  });
  balances.forEach((balance, i) => {
    const token = validTokensAndOwners[i][0];
    api.add(tokenMapping[token], balance);
  });
}

const _getFolioLogs = async (api, folioDeployers) => {
  const allLogs = await Promise.all(
    folioDeployers.flatMap((deployer) => [
      getLogs({
        api,
        target: deployer.address,
        eventAbi: "event FolioDeployed(address indexed folioOwner, address indexed folio, address folioAdmin)",
        fromBlock: deployer.startBlock,
        onlyArgs: true,
      }).catch(() => []),
      getLogs({
        api,
        target: deployer.address,
        eventAbi: "event GovernedFolioDeployed(address indexed stToken, address indexed folio, address ownerGovernor, address ownerTimelock, address tradingGovernor, address tradingTimelock)",
        fromBlock: deployer.startBlock,
        onlyArgs: true,
      }).catch(() => [])
    ])
  );

  const folios = allLogs.flat().map(log => log.folio).filter(Boolean);
  return [...new Set(folios)];
};

const getFolioTotalAssets = async (api, folios) => {
  if (!folios.length) return;

  const totalAssetsResults = await api.multiCall({
    abi: "function totalAssets() view returns (address[] _assets, uint256[] _amounts)",
    calls: folios,
    permitFailure: true,
  });

  totalAssetsResults.forEach((result) => {
    if (!result) return;
    const [assets, amounts] = result;
    assets.forEach((asset, i) => {
      api.add(asset, amounts[i]);
    });
  });
};

const _getStakingTokenLogs = async (api, governanceDeployers) => {
  if (!governanceDeployers) return [];
  
  const allLogs = await Promise.all(
    governanceDeployers.map((deployer) =>
      getLogs({
        api,
        target: deployer.address,
        eventAbi: "event DeployedGovernedStakingToken(address indexed underlying, address indexed stToken, address governor, address timelock)",
        fromBlock: deployer.startBlock,
        onlyArgs: true,
      }).catch(() => [])
    )
  );
  
  return allLogs.flat();
};

const getStakingTokenAssets = async (api, stakingTokenLogs) => {
  if (!stakingTokenLogs.length) return;
  
  const stTokens = stakingTokenLogs.map(log => log.stToken);
  const underlyings = stakingTokenLogs.map(log => log.underlying);
  
  const totalAssets = await api.multiCall({
    abi: "uint256:totalAssets",
    calls: stTokens,
    permitFailure: true,
  });
  
  totalAssets.forEach((assets, i) => {
    if (assets) {
      api.add(underlyings[i], assets);
    }
  });
};

module.exports = {
  getStargateLpValues,
  getCompoundUsdcValues,
  _getLogs,
  unwrapCreamTokens,
  genericUnwrapCvxDeposit,
  _getFolioLogs,
  getFolioTotalAssets,
  _getStakingTokenLogs,
  getStakingTokenAssets,
};
