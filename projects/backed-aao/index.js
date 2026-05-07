const { sumTokens2 } = require('../helper/unwrapLPs')
const { START, getTokensAndOwnersMulti } = require('./helper')

async function tvl(api) {
  const tokensAndOwners = await getTokensAndOwnersMulti(api, ['sale', 'treasury'])
  if (!tokensAndOwners.length) return {}
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology:
    'TVL is the sum of each project collateral token held in the Sale contract (during raise) and in the project Treasury (after proceeds are transferred), for all projects from AgentRaiseFactory on MegaETH.',
  start: START,
  megaeth: { tvl },
}
