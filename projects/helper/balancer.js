const { sumTokens2 } = require("./unwrapLPs");
const { getLogs } = require("./cache/getLogs");
const { cachedGraphQuery } = require("./cache");

function onChainTvl(
  vault,
  fromBlock,
  {
    blacklistedTokens = [],
    preLogTokens = [],
    onlyUseExistingCache,
    permitFailure,
  } = {}
) {
  return async (api) => {
    let poolRegisteredKey = "PoolRegistered";
    let tokensRegisteredKey = "TokensRegistered";

    // there is some bug in the cache, this will force reset it
    if (
      vault.toLowerCase() === "0xba12222222228d8ba445958a75a0704d566bf2c8" &&
      api.chain === "xdai"
    ) {
      poolRegisteredKey = "PoolRegistered-xdai";
      tokensRegisteredKey = "TokensRegistered-xdai";
    }
    const logs = await getLogs({
      api,
      target: vault,
      topics: [
        "0x3c13bc30b8e878c53fd2a36b679409c073afd75950be43d8858768e956fbc20e",
      ],
      fromBlock,
      eventAbi:
        "event PoolRegistered(bytes32 indexed poolId, address indexed poolAddress, uint8 specialization)",
      onlyArgs: true,
      extraKey: poolRegisteredKey,
      onlyUseExistingCache,
    });
    const logs2 = await getLogs({
      api,
      target: vault,
      topics: [
        "0xf5847d3f2197b16cdcd2098ec95d0905cd1abdaf415f07bb7cef2bba8ac5dec4",
      ],
      fromBlock,
      eventAbi:
        "event TokensRegistered(bytes32 indexed poolId, address[] tokens, address[] assetManagers)",
      onlyArgs: true,
      extraKey: tokensRegisteredKey,
      onlyUseExistingCache,
    });

    const tokens = logs2.map((i) => i.tokens).flat();
    tokens.push(...preLogTokens);
    const pools = logs.map((i) => i.poolAddress);
    blacklistedTokens = [...blacklistedTokens, ...pools];

    return sumTokens2({
      api,
      owner: vault,
      tokens,
      blacklistedTokens,
      permitFailure,
    });
  };
}

function v3Tvl(
  vault,
  fromBlock,
  {
    blacklistedTokens = [],
    preLogTokens = [],
    onlyUseExistingCache,
    permitFailure,
  } = {}
) {
  return async (api) => {
    const regsistedEvents =
      "event PoolRegistered(address indexed pool, address indexed factory, (address token, uint8 tokenType, address rateProvider, bool paysYieldFees)[] tokenConfig, uint256 swapFeePercentage, uint32 pauseWindowEndTime, (address pauseManager, address swapFeeManager, address poolCreator) roleAccounts, (bool enableHookAdjustedAmounts, bool shouldCallBeforeInitialize, bool shouldCallAfterInitialize, bool shouldCallComputeDynamicSwapFee, bool shouldCallBeforeSwap, bool shouldCallAfterSwap, bool shouldCallBeforeAddLiquidity, bool shouldCallAfterAddLiquidity, bool shouldCallBeforeRemoveLiquidity, bool shouldCallAfterRemoveLiquidity, address hooksContract) hooksConfig, (bool disableUnbalancedLiquidity, bool enableAddLiquidityCustom, bool enableRemoveLiquidityCustom, bool enableDonation) liquidityManagement)";

    const logs = await getLogs({
      api,
      target: vault,
      fromBlock,
      eventAbi: regsistedEvents,
      onlyArgs: true,
      extraKey: "PoolRegistered",
      topics: [
        "0xbc1561eeab9f40962e2fb827a7ff9c7cdb47a9d7c84caeefa4ed90e043842dad",
      ],
      onlyUseExistingCache,
      permitFailure,
    });

    const pools = logs.map((i) => i.pool);

    const getPoolTokenInfoAbi =
      "function getPoolTokenInfo(address pool) view returns (address[] tokens, (address token, uint8 tokenType, address rateProvider, bool paysYieldFees)[] tokenInfo, uint256[] balancesRaw, uint256[] lastLiveBalances)";

    try {
      const res = await api.multiCall({
        target: vault,
        abi: getPoolTokenInfoAbi,
        calls: pools.map((pool) => ({ params: [pool] })),
        permitFailure: true,
      });

      const tokenBalances = [];
      for (const r of res) {
        if (!r || !Array.isArray(r.tokens)) continue;
        r.tokens.forEach((t, i) => {
          const bal = r.balancesRaw?.[i];
          if (bal != null) tokenBalances.push([t, bal]);
        });
      }

      if (!tokenBalances.length) throw new Error("null value of tokens");

      const blSet = new Set([...blacklistedTokens, ...pools].map((s) => s.toLowerCase()));
      tokenBalances = tokenBalances.filter(([t]) => !blSet.has(String(t).toLowerCase()));

      await api.addTokens(tokenBalances);

      return api.getBalances();
    } catch {
      const tokens = [
        ...logs.map((i) => i.tokenConfig.map((i) => i.token)).flat(),
        ...preLogTokens,
      ];

      blacklistedTokens = [...blacklistedTokens, ...pools].map((i) =>
        i.toLowerCase()
      );
      return api.sumTokens({ owner: vault, tokens, blacklistedTokens });
    }
  };
}

  function v1Tvl(bPoolFactory, fromBlock, { blacklistedTokens = [] } = {}) {
    return async (api) => {
      let poolLogs = await getLogs({
        target: bPoolFactory,
        topic: "LOG_NEW_POOL(address,address)",
        fromBlock,
        api,
        eventAbi:
          "event LOG_NEW_POOL (address indexed caller, address indexed pool)",
        onlyArgs: true,
      });

      const pools = poolLogs.map((i) => i.pool);
      const tokens = await api.multiCall({
        abi: "address[]:getCurrentTokens",
        calls: pools,
      });
      const ownerTokens = tokens.map((v, i) => [v, pools[i]]);
      return sumTokens2({
        api,
        ownerTokens,
        blacklistedTokens: [...blacklistedTokens, ...pools],
      });
    };
  }

function balV2GraphExport({
  vault,
  blacklistedTokens = [],
  graphURL,
  name,
  permitFailure,
}) {
  return async (api) => {
    if (!graphURL) {
      throw new Error("graphURL is required");
    }
    if (!name) {
      throw new Error("name is required (it is used as id for caching)");
    }
    const query = `{ tokens(first: 1000) { address } }`;
    const tokens = (await cachedGraphQuery(name, graphURL, query)).tokens.map(
      (t) => t.address
    );
    return sumTokens2({
      api,
      owner: vault,
      tokens,
      blacklistedTokens,
      permitFailure,
    });
  };
}

module.exports = {
  onChainTvl,
  v1Tvl,
  balV2GraphExport,
  v3Tvl,
};
