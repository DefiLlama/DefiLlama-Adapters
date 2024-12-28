const { function_view } = require("../helper/chain/aptos");

async function _getPoolInfo(offset, limit) {
  const poolInfo = await function_view({
    functionStr: "0x6cd504c269458a3a24ef21063c21bd222eb82cb75ac51f4622787a23558fa488::liquidity_pool::all_pools_with_info",
    args: [String(offset), String(limit)],
    type_arguments: [],
  });

  return poolInfo;
}

async function _getCoinInfo(faType) {
  const coinInfo = await function_view({
    functionStr: "0x1::coin::paired_coin",
    args: [faType],
    type_arguments: [],
  });

  if (coinInfo.vec.length > 0) {
    const address = coinInfo.vec[0].account_address;
    const module = Buffer.from(coinInfo.vec[0].module_name.replace('0x', ''), 'hex').toString('utf-8');
    const struct = Buffer.from(coinInfo.vec[0].struct_name.replace('0x', ''), 'hex').toString('utf-8');

    return (address + "::" + module + "::" + struct);
  } else {
    return null;
  }
}

async function getPoolInfo() {
  let offset = 0;
  let limit = 100;
  let poolInfo = [];
  let [data, pager] = await _getPoolInfo(offset, limit);

  if (data.length !== 0) {
    poolInfo = poolInfo.concat(data);
  }

  while (offset + limit < pager.total) {
    offset += limit;
    [data, pager] = await _getPoolInfo(offset, limit);
    poolInfo = poolInfo.concat(data);
  }

  return poolInfo;
}

module.exports = {
  timetravel: false,
  methodology: "Counts the total liquidity in all pools on Hyperfluid.",
  aptos: {
    tvl: async (api) => {
      const poolInfo = await getPoolInfo();
      let balances = {};

      for (const pool of poolInfo) {
        const coin1 = await _getCoinInfo(pool.token_1.inner) || pool.token_1.inner;
        const coin2 = await _getCoinInfo(pool.token_2.inner) || pool.token_2.inner;

        api.add(coin1, pool.token_1_reserve);
        api.add(coin2, pool.token_2_reserve);
      }
    },
  },
};

