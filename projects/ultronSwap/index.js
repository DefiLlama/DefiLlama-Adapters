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
      tokens: ['0x3a4F06431457de873B588846d139EC0d86275d54'], 
      chain: 'ultron'
    })
  }
};