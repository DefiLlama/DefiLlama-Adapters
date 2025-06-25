const { sumTokens } = require('./helper/chain/bitcoin')
const { imbtc } = require('./helper/bitcoin-book/index.js')

module.exports = {
  ethereum: { tvl: () => ({}) },
  bitcoin: {
    tvl: () => sumTokens({
      owners: imbtc,
    })
  },
  methodology: `TVL for imBTC consists of the BTC deposits in custody that were used to mint imBTC`,
  hallmarks: [
    ['2024-01-31', 'Project ceases operation'],
  ],
}
