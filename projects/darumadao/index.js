const { sumTokensExport } = require('../helper/unknownTokens')

const STAKING_ADDRESS = '0x31A7D9c604C87F7aA490A350Ef8DF170dC2233AA'
const DRM_ADDRESS = '0x81E60A955DC8c4d25535C358fcFE979351d102B5'
const DRM_USDC_LP_ADDRESS = '0x268aaeed47d031751db1cbba50930fe2991f0ed0'

module.exports = {
  misrepresentedTokens: true,
  methodology: `Finds TVL by querying DRM contract for sDRM (Staked DRM) supply and the DRM price. TVL = sdrmSupply * drmPrice`,
  godwoken: {
    tvl: async ()=>({}),
    staking: sumTokensExport({ useDefaultCoreAssets: true, tokensAndOwners: [[DRM_ADDRESS, STAKING_ADDRESS]], lps: [DRM_USDC_LP_ADDRESS] }),
  }
}