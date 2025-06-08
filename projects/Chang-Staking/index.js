const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/unknownTokens')


module.exports = {
  misrepresentedTokens: true,
  changchain: {
    tvl: () => ({}),
    staking: staking({
      owner: '0x2D49b31631f74FcADD9f9c0464db4D3Db30Cb11f', 
      tokens: [ADDRESSES.changcoin.CTH], 
      chain: 'changchain'
    })
  }
};
