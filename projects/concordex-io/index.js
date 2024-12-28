const { post } = require('../helper/http')

async function tvl(api) {
  const body = {"jsonrpc":"2.0","method":"liquidity_pools_list","params":{"filter":{"sort":"EFFECTIVE_TVL","page":1,"is_desc":true,"search":"","limit":999}},"id":0}
  const { result: { pools }} = await post('https://cdex-liquidity-pool.concordex.io/v1/rpc', body)
  return {
    tether: pools.reduce((acc, i) => acc + +i.tvl, 0)
  }
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  concordium: { tvl },
}
