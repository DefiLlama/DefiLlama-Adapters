const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/unknownTokens')


module.exports = {
  misrepresentedTokens: true,
  ultron: {
    tvl: () => ({}),
    staking: staking({
      owner: '0xd130811147bb87f313c555e5281b94b9e71b480a', 
      tokens: [ADDRESSES.ultron.wULX], 
      chain: 'ultron'
    })
  }
};