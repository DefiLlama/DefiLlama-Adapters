const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/unknownTokens')


module.exports = {
  misrepresentedTokens: true,
  ultron: {
    tvl: () => ({}),
    staking: staking({
      owner: '0x60768787077a8411d8f626ce35333fa3f02be602', 
      tokens: [ADDRESSES.ultron.wULX], 
      chain: 'ultron'
    })
  }
};
