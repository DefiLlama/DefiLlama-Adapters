const { sumTokens } = require('../helper/chain/algorand')

// HAY ASA on Algorand
const HAY_ASA_ID = '3160000000'

// Single staking escrow account that holds all staked HAY
const STAKING_ESCROW = 'OLSICPA5V6IPWORUVWQKCJTSFKLP7P5JORZBICKU6CH7W7EVMDALLWD7SQ'

async function staking() {
  return sumTokens({
    owner: STAKING_ESCROW,
    tokens: [HAY_ASA_ID],
  })
}

module.exports = {
  timetravel: false,
  methodology: 'Counts the total HAY tokens held in the Haystack staking escrow account on Algorand.',
  algorand: {
    tvl: () => ({}),
    staking,
  },
}

