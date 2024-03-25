const { queryContract, getToken, sumTokens } = require('../helper/chain/cosmos')

const MARKET_ADDR = 'inj1nc7gjkf2mhp34a6gquhurg8qahnw5kxs5u3s4u';

async function tvl(api) {
  return sumTokens({ chain: api.chain, owner: MARKET_ADDR})
}

async function borrowed(api) {
  // query market-state
  const { markets, } = await queryContract({ chain: api.chain, contract: MARKET_ADDR, data: { get_state: {} } })

  // get all borrowed
  markets.map(market => {
    let denom = getToken(market[0])
    api.add(denom, market[1].debt_pool.balance)
  })
}

module.exports = {
  methodology: 'Counts the total collateral and non-borrowed lent assets managed by Neptune on Injective',
  injective: {
    tvl, borrowed
  }
};
