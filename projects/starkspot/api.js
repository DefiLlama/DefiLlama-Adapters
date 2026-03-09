// https://www.starknetjs.com/docs/API/contract

const { call, multiCall, parseAddress } = require("../helper/chain/starknet");
const { getCache, setCache } = require("../helper/cache");
const abi = require("./abi");
const { transformDexBalances } = require("../helper/portedTokens");
const factory =
  "0x594074315e98393351438011f5a558466f1733fde666f73f41738a39804c27";

async function tvl() {
  let { all_pairs } = await call({
    target: factory,
    abi: abi.factory.get_all_pairs,
  });

  const calls = all_pairs.map((i) => parseAddress(i));
  const cache = (await getCache("starkspot", "starknet")) ?? {};
  if (!cache.token0s) {
    cache.token0s = [];
    cache.token1s = [];
  }
  const oldCacheLength = cache.token0s.length;
  const newCalls = calls.slice(oldCacheLength);

  const _token0s = await multiCall({ abi: abi.pair.token0, calls: newCalls });
  const _token1s = await multiCall({ abi: abi.pair.token1, calls: newCalls });
  const reserves = await multiCall({ abi: abi.pair.get_reserves, calls, permitFailure: true, });
  cache.token0s.push(..._token0s);
  cache.token1s.push(..._token1s);
  if (cache.token0s.length > oldCacheLength)
    await setCache("starkspot", "starknet", cache);

  const data = [];
  reserves.forEach((reserve, i) => {
    if (!reserve) return;
    data.push({
      token0: cache.token0s[i],
      token1: cache.token1s[i],
      token0Bal: +reserve.reserve0,
      token1Bal: +reserve.reserve1,
    });
  });

  return transformDexBalances({ chain: "starknet", data });
}

module.exports = {
  // deadFrom: '2025-01-04',
  timetravel: false,
  starknet: {
    tvl,
  },
};
