const { addAddressPadding } = require('starknet')
const { call, multiCall, parseAddress } = require("../helper/chain/starknet");
const { getCache, setCache } = require("../helper/cache");
const abi = require("./abi");
const { transformDexBalances } = require("../helper/portedTokens");

const factory = "0x352e14b9bdc0138e48b55d45914b059f0388284c77a23a97776e6197852f050";

async function tvl() {
  let all_pairs = await call({
    target: factory,
    abi: abi.factory.all_pairs,
  });

  const calls = all_pairs.map((i) => parseAddress(i));
  const cache = (await getCache("nostra-pools", "starknet")) ?? {};

  if (!cache.token0s) {
    cache.token0s = [];
    cache.token1s = [];
  }

  const oldCacheLength = cache.token0s.length;
  const newCalls = calls.slice(oldCacheLength);

  const _token0s = await multiCall({ abi: abi.pair.token_0, calls: newCalls });
  const _token1s = await multiCall({ abi: abi.pair.token_1, calls: newCalls });
  const reserves = await multiCall({ abi: abi.pair.get_reserves, calls });

  cache.token0s.push(..._token0s.map((i) => addAddressPadding(i)));
  cache.token1s.push(..._token1s.map((i) => addAddressPadding(i)));

  if (cache.token0s.length > oldCacheLength) {
    await setCache("nostra-pools", "starknet", cache);
  }

  const data = [];
  reserves.forEach((reserve, i) => {
    data.push({
      token0: cache.token0s[i],
      token1: cache.token1s[i],
      token0Bal: +reserve["0"],
      token1Bal: +reserve["1"],
    });
  });

  return transformDexBalances({ chain: "starknet", data });
}

module.exports = {
  starknet: {
    tvl,
  },
  hallmarks: [
    [1706106000, "Nostra Pools launch"],
  ]
};
