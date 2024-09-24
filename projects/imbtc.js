const { sumTokens } = require('./helper/chain/bitcoin')

module.exports = {
  ethereum: { tvl: () => ({}) },
  bitcoin: {
    tvl: () => sumTokens({
      owners: ['3JMjHDTJjKPnrvS7DycPAgYcA6HrHRk8UG', '3GH4EhMi1MG8rxSiAWqfoiUCMLaWPTCxuy'],
    })
  },
  methodology: `TVL for imBTC consists of the BTC deposits in custody that were used to mint imBTC`,
  hallmarks: [
    [Math.floor(new Date('2024-01-31') / 1e3), 'Project ceases operation'],
  ],
}
