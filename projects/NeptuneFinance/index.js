const { queryContract } = require('../helper/chain/cosmos')

const MARKET_ADDR = 'inj1nc7gjkf2mhp34a6gquhurg8qahnw5kxs5u3s4u';

// For testing run
// export LLAMA_DEBUG_MODE="true" 
// node test.js projects/NeptuneFinance/index.js

async function tvl(_, _1, _2, { api }) {
  // query market-state
  const config = { chain: api.chain, contract: MARKET_ADDR }
  const { markets, collaterals } = await queryContract({ ...config, data: { get_state: {} } })

  // get all lending
  markets.map(market => {
    let denom = undefined
    if (market[0].hasOwnProperty('native_token')) {
      denom = market[0].native_token.denom
    }
    else if (market[0].hasOwnProperty('token')) {
      denom = market[0].token.contract_addr
    }

    api.add(denom, market[1].lending_principal)
  })

  // get all collaterals
  collaterals.map(collateral => {
    //if (collateral[1].collateral_details.collateral_type == 'regular') {
      let denom = undefined
      if (collateral[0].hasOwnProperty('native_token')) {
        denom = collateral[0].native_token.denom
      }
      else if (collateral[0].hasOwnProperty('token')) {
        denom = collateral[0].token.contract_addr
      }
      console.log("%s : %s@", denom, collateral[1].collateral_pool.balance)
      api.add(denom, collateral[1].collateral_pool.balance)
    //}
  })
}

async function borrowed(_, _1, _2, { api }) {
  // query market-state
  const config = { chain: api.chain, contract: MARKET_ADDR }
  const { markets, collaterals } = await queryContract({ ...config, data: { get_state: {} } })

  // get all borrowed
  markets.map(market => {
    let denom = undefined
    if (market[0].hasOwnProperty('native_token')) {
      denom = market[0].native_token.denom
    }
    else if (market[0].hasOwnProperty('token')) {
      denom = market[0].token.contract_addr
    }

    api.add(denom, market[1].debt_pool.balance)
  })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  //start: 1000235,
  methodology: 'Counts the total collateral and borrowed assets managed by Neptune on Injective',
  injective: {
    tvl, borrowed
  }
};
