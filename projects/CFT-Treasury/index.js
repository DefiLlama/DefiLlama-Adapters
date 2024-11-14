const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress, } = require('../helper/sumTokens')

module.exports = {
  tron: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [nullAddress, 'TFvHNqDqttkXSS8ZTdC4c4W7q97SFW3iKq'],
        
      ]
    }),
  },
};
