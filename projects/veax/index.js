const axios = require('axios');
const { sumSingleBalance } = require('../helper/chain/near')

const POOLS_SERVICE_URL = 'https://veax-liquidity-pool.veax.com/v1/rpc'

const rpc = (url, method, params) =>
  axios.post(
    POOLS_SERVICE_URL,
    {
      jsonrpc: '2.0',
      method,
      params,
      id: '0',
    },
    {
      headers: {
        'Content-Type': 'application/json',
      }
    }
  )
    .then(res => res.data.result);

const fetchPools = (page, limit) =>
  rpc(
    POOLS_SERVICE_URL,
    'liquidity_pools_list',
    {
      filter: {
        page,
        limit,
        sort: 'NONE',
        is_desc: true,
        search: '',
      }
    }
  )

const tvl = async () => {
  let page = 0
  const limit = 500
  const balances = {};

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const {pools, total} = await fetchPools(page, limit);

    pools
      .map((pool) => [[pool.token_a, pool.total_amount_a],[pool.token_b, pool.total_amount_b]])
      .forEach((pair) => {
        pair.forEach(([token, value]) => {
          if(+value) {
            sumSingleBalance(balances, token, value)
          }
        })
      })

    if((page + 1) * limit > total) {
      return balances
    }
  }
}

module.exports = {
  near: {
    tvl,
  }
}