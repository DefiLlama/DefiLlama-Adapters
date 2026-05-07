const { sumTokens2 } = require('../helper/unwrapLPs')
const { START, getTokensAndOwners } = require('../backed-aao/helper')

async function tvl(api) {
  const tokensAndOwners = await getTokensAndOwners(api, 'treasury')
  if (!tokensAndOwners.length) return {}
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology:
    'TVL is the sum of collateral tokens currently held by every project treasury Safe deployed by the AgentRaiseFactory on MegaETH.',
  start: START,
  megaeth: { tvl },
}
