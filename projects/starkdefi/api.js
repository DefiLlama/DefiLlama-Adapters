// https://www.starknetjs.com/docs/API/#contract
const { call, multiCall, parseAddress } = require("../helper/chain/starknet");
const { getCache, setCache } = require("../helper/cache");
const abi = require("./abi");
const { transformDexBalances } = require("../helper/portedTokens");

const factory =
  "0x02721f5ab785ae5E13b276ca9d41e859B7b150440A288A7826Ba5E27Dd05E08e";

async function tvl() {
  const { 1: all_pairs } = await call({
    target: factory,
    abi: abi.factory.all_pairs,
  });
  const calls = all_pairs.map((i) => parseAddress(i));

  const cache = (await getCache("starkdefi", "starknet")) ?? {};
  if (!cache.all_token0) {
    cache.all_token0 = [];
    cache.all_token1 = [];
  }

  const _oldCacheLen = cache.all_token0.length;
  const _newCalls = calls.slice(_oldCacheLen);

  const snapshots = await multiCall({
    abi: abi.pair.snapshot,
    allAbi: [...abi.pabistructs],
    calls,
  });

  const [_all_token0_hex, _all_token1_hex] = snapshots.reduce(
    (memo, { token0, token1 }) => {
      memo[0].push(parseAddress(token0));
      memo[1].push(parseAddress(token1));
      return memo;
    },
    [[], []]
  );

  cache.all_token0.push(..._all_token0_hex);
  cache.all_token1.push(..._all_token1_hex);

  if (cache.all_token0.length > _oldCacheLen)
    await setCache("starkdefi", "starknet", cache);

  const data = [];
  snapshots.forEach((snapshot, i) => {
    const { reserve0, reserve1 } = snapshot;
    data.push({
      token0: cache.all_token0[i],
      token1: cache.all_token1[i],
      token0Bal: reserve0.toString(),
      token1Bal: reserve1.toString(),
    });
  });

  return transformDexBalances({ chain: "starknet", data });
}

module.exports = {
  timetravel: false,
  methodology: "Value of all LP available in the DEX",
  starknet: {
    tvl,
  },
};
