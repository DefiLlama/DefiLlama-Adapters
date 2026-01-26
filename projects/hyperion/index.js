const { function_view } = require("../helper/chain/aptos");
const { sleep } = require("../helper/utils");

const coinInfoCache = new Map();
const PAIRED_COIN_DELAY_MS = 1000;
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

const hexToUtf8 = (hexStr) => Buffer.from(String(hexStr).replace(/^0x/, ''), 'hex').toString('utf-8');

const backoffMs = (i) => BASE_BACKOFF_MS * (i + 1) * (i + 1);

async function callWithRetry(fn) {
  let lastErr;
  for (let i = 0; i <= MAX_RETRIES; i++) {
    const sentinel = Symbol('ERR');
    const res = await fn().catch((e) => { lastErr = e; return sentinel; });
    if (res !== sentinel) return res;
    if (i === MAX_RETRIES) throw lastErr;
    await sleep(backoffMs(i));
  }
}

async function _getPoolInfo(offset, limit) {
  return function_view({
    functionStr: "0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c::pool_v3::all_pools_with_info",
    args: [String(offset), String(limit)],
    type_arguments: [],
  });
}

async function _getCoinInfo(faType) {
  if (coinInfoCache.has(faType)) return coinInfoCache.get(faType);

  await sleep(PAIRED_COIN_DELAY_MS);

  const coinInfo = await callWithRetry(() =>
    function_view({ functionStr: "0x1::coin::paired_coin", args: [faType], type_arguments: [] })
  );

  if (!coinInfo || !coinInfo.vec || coinInfo.vec.length === 0) {
    coinInfoCache.set(faType, null);
    return null;
  }

  const v = coinInfo.vec[0];
  const out = `${v.account_address}::${hexToUtf8(v.module_name)}::${hexToUtf8(v.struct_name)}`;
  coinInfoCache.set(faType, out);
  return out;
}

async function getPoolInfo() {
  let offset = 0;
  const limit = 100;
  let pools = [];
  let [data, pager] = await _getPoolInfo(offset, limit);
  if (data.length) pools = pools.concat(data);

  while (offset + limit < pager.total) {
    offset += limit;
    [data, pager] = await _getPoolInfo(offset, limit);
    if (data.length) pools = pools.concat(data);
  }
  return pools;
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  methodology: "Counts the total liquidity in all pools on Hyperion.",
  aptos: {
    tvl: async (api) => {
      const pools = await getPoolInfo();
      api.log(`Hyperion Number of pools: ${pools.length}`);

      for (const pool of pools) {
        const coin1 = (await _getCoinInfo(pool.token_a.inner)) || pool.token_a.inner;
        const coin2 = (await _getCoinInfo(pool.token_b.inner)) || pool.token_b.inner;

        api.add(coin1, pool.token_a_reserve);
        api.add(coin2, pool.token_b_reserve);
      }
    },
  },
};
