const { transformDexBalances } = require('../helper/portedTokens');
const { post } = require('../helper/http');
async function tvl() {
  // addr1w9a3urry4uuwjp2hjawlqfu9lqgvzead3mz3pt7kle5rwng6gu8yl
  const Pairs = (await post('https://api.meowswap.fi/?method=Info.Pairs', { "jsonrpc": "2.0", "method": "Info.Pairs", "id": 3, "params": {} })).result.data

  let totalLiquid = 0;
  const data = []
  await Pairs.forEach((row) => {
    data.push({
      token0: row.token1,
      token1: row.token2,
      token0Bal: row.pair_sum_q1,
      token1Bal: row.pair_sum_q2,
    })
    if (row.token1 === 'ADA') {
      totalLiquid += row.pair_sum_q1 * 2
    } else if (row.token2 === 'ADA') {
      totalLiquid += row.pair_sum_q2 * 2
    }
  });
  return transformDexBalances({ chain: 'cardano', data });
}

module.exports = {
  methodology: "Data is retrieved from the api at https://api.meowswap.fi/",
  timetravel: false,
  cardano: {
    tvl: () => ({})
  }
}
