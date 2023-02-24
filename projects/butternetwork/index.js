const { sumTokensExport } = require('../helper/sumTokens')

const config = {
  'bsc': {
    'mosAddress': '0x630105189c7114667a7179Aa57f07647a5f42B7F',
    'tokenHoldingList': [
      '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' // usdc
    ]
  },
  'near': {
    'mosAddress': 'mos.mfac.butternetwork.near',
    'tokenHoldingList': [
      'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near' // usdc
    ]
  },
  'polygon': {
    'mosAddress': '0x630105189c7114667a7179Aa57f07647a5f42B7F',
    'tokenHoldingList': [
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'  // usdc
    ]
  }
}

module.exports = {
  methodology: 'get the amount of token deposited in MOS contract on each supported chain.',
};

Object.keys(config).forEach(chain => {
  const { mosAddress, tokenHoldingList } = config[chain]
  module.exports[chain] = {
    tvl:sumTokensExport({ owner: mosAddress, tokens: tokenHoldingList, chain, })
  }
})