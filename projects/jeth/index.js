const { sumTokensExport } = require('../helper/sumTokens')
const ADDRESSES = require("../helper/coreAssets.json");

const JETH_ADDRESS = 'EQCb1SAX1heK9tK8a5CXtYSbdHXkPPAXWKTy3Yz5PH1lglIu'

module.exports = {
  methodology: 'Total amount of ETH locked in smart contract EQCb1SAX1heK9tK8a5CXtYSbdHXkPPAXWKTy3Yz5PH1lglIu.',
  start: '2024-12-05',
  ton: {
    tvl: sumTokensExport({ owner: JETH_ADDRESS, tokens: [ADDRESSES.null]}),
  }
}
