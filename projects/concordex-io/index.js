const { post, get } = require('../helper/http')

async function tvl(_, _b, _cb, { api, }) {
  const body = {"jsonrpc":"2.0","method":"liquidity_pools_list","params":{"filter":{"sort":"EFFECTIVE_TVL","page":1,"is_desc":true,"search":"","limit":999}},"id":0}
  const { result: { pools }} = await post('https://cdex-liquidity-pool.concordex.io/v1/rpc', body)
  const { rates } = await get('https://open.er-api.com/v6/latest/EUR');
  return {
    tether: pools.reduce((acc, i) => acc + +i.tvl, 0) * rates['USD']
  }
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  concordium: { tvl },
}