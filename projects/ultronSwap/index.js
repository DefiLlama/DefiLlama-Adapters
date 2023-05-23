const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL, staking } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  ultron: {
    tvl: getUniTVL({
      chain: 'ultron',
      useDefaultCoreAssets: true,
      factory: '0xe1F0D4a5123Fd0834Be805d84520DFDCd8CF00b7',
    }),
    staking: staking({
      owner: '0xf26E50c26Ed51AbeC4078380Ed1F13440011F2A1', 
      tokens: [ADDRESSES.ultron.wULX], 
      chain: 'ultron'
    })
  }
};