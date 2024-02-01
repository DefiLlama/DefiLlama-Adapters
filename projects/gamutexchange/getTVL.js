const swapAbi = require("./abi");
const {
  transformBalances,
  transformDexBalances,
} = require("../helper/portedTokens");
const { getCoreAssets } = require("../helper/tokenMapping");
const sdk = require("@defillama/sdk");

function getTVL({
  chain,
  coreAssets,
  blacklist = [],
  factory,
  blacklistedTokens,
  useDefaultCoreAssets = false,
  abis = {},
}) {
  if (!coreAssets && useDefaultCoreAssets) coreAssets = getCoreAssets(chain);
  blacklist = (blacklistedTokens || blacklist).map((i) => i.toLowerCase());

  const abi = { ...swapAbi, ...abis };
  factory = factory.toLowerCase();

  return async (ts, _block, { [chain]: block }) => {
    let ca = { pairs: [], token0s: [], token1s: [] };
    const length = await sdk.api2.abi.call({
      abi: abi.allPoolsLength,
      target: factory,
      chain,
      block,
    });
    sdk.log(chain, " No. of pairs: ", length);
    const pairCalls = [];
    for (let i = 0; i < length; i++) pairCalls.push(i);

    const calls = await sdk.api2.abi.multiCall({
      block,
      chain,
      abi: abi.allPools,
      calls: pairCalls,
      target: factory,
    });

    const tokenData = await sdk.api2.abi.multiCall({
      abi: abi.getPoolTokensAndBalances,
      chain,
      block,
      calls,
    });

    const t0 = [],
      t1 = [],
      re = [];
    tokenData.forEach((item, index) => {
      t0.push(item[0][0]);
      t1.push(item[0][1]);
      re.push({ _reserve0: item[1][0], _reserve1: item[1][1] });
    });

    ca.pairs.push(...calls);
    ca.token0s.push(...t0);
    ca.token1s.push(...t1);

    if (coreAssets) {
      const data = [];
      re.forEach(({ _reserve0, _reserve1 }, i) => {
        data.push({
          token0: ca.token0s[i],
          token1: ca.token1s[i],
          token1Bal: _reserve1,
          token0Bal: _reserve0,
        });
      });
      return transformDexBalances({
        chain,
        data,
        coreAssets,
        blacklistedTokens: blacklist,
      });
    }

    const balances = {};
    const blacklistedSet = new Set(blacklist);
    re.forEach(({ _reserve0, _reserve1 }, i) => {
      if (!blacklistedSet.has(ca.token0s[i].toLowerCase()))
        sdk.util.sumSingleBalance(balances, ca.token0s[i], _reserve0);
      if (!blacklistedSet.has(ca.token1s[i].toLowerCase()))
        sdk.util.sumSingleBalance(balances, ca.token1s[i], _reserve1);
    });
    return transformBalances(chain, balances);
  };
}

module.exports = {
  getTVL,
};
