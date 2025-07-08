const sdk = require("@defillama/sdk");
const { getResource, getTableData, } = require("../helper/chain/aptos");

let data

async function getData() {
  if (!data) data = _getData()
  return data

  async function _getData() {
    const lendPool = await getResource('0xabaf41ed192141b481434b99227f2b28c313681bc76714dc88e5b2e26b24b84c', '0xb7d960e5f0a58cc0817774e611d7e3ae54c6843816521f02d7ced583d6434896::pool::LendProtocol')
    const coins = lendPool.coins
    const table = lendPool.pools.handle

    const params = {
      key_type: '0x1::string::String',
      value_type: '0xb7d960e5f0a58cc0817774e611d7e3ae54c6843816521f02d7ced583d6434896::pool::Pool',
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
      return  data.tvl
    },
    borrowed: async () => {
      const data = await getData()
      return data.borrowed
    },
  },
};
