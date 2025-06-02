const sdk = require("@defillama/sdk");
const { getResource, getTableData, } = require("../helper/chain/aptos");

let data

async function getData() {
  if (!data) data = _getData()
  return data

  async function _getData() {
    const lendPool = await getResource('0x719b1538162dae27f6d818b384dcf82f198b5c5a90b605d3c9aec1189013a73c', '0x3c1d4a86594d681ff7e5d5a233965daeabdc6a15fe5672ceeda5260038857183::pool::LendProtocol')
    const coins = lendPool.coins
    const table = lendPool.pools.handle

    const params = {
      key_type: '0x1::string::String',
      value_type: '0x3c1d4a86594d681ff7e5d5a233965daeabdc6a15fe5672ceeda5260038857183::pool::Pool',
    }
    const coinInfos = await Promise.all(coins.map(i => getTableData({ table, data: { ...params, key: i } })))
    const balances = {
      tvl: {},
      borrowed: {},
    }
    coinInfos.forEach((data, i) => {
      sdk.util.sumSingleBalance(balances.tvl, coins[i], data.supply_pool.total_value - data.borrow_pool.total_value, 'aptos')
      sdk.util.sumSingleBalance(balances.borrowed, coins[i], data.borrow_pool.total_value, 'aptos')
    })

    return balances
  }
}


module.exports = {
  timetravel: false,
  methodology:
    "TVL contains the sum of the supply of all markets in the Aptin protocol contract, borrowed tokens are not counted.",
  aptos: {
    tvl: async () => {
      const data = await getData()
      return data.tvl
    },
    borrowed: async () => {
      const data = await getData()
      return data.borrowed
    },
  },
};
