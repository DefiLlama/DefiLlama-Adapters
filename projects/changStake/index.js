const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/unknownTokens')


module.exports = {
  misrepresentedTokens: true,
  changchain: {
    tvl: () => ({}),
    staking: staking({
      owner: '0x0e6cF7C13aB088fBb216Db1DD768E622f838a382', 
      tokens: [ADDRESSES.changchain.changcoin], 
      chain: 'changchain'
    })
  }
};
