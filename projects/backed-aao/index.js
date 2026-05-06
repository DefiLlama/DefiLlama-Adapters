const { sumTokens2 } = require('../helper/unwrapLPs')
const { START, getTokensAndOwners } = require('./helper')

async function tvl(api) {
  const tokensAndOwners = await getTokensAndOwners(api, 'sale')
  if (!tokensAndOwners.length) return {}
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology:
    'TVL is the sum of collateral tokens currently held by every Backed Sale contract deployed by the AgentRaiseFactory on MegaETH.',
  start: START,
  megaeth: { tvl },
}
