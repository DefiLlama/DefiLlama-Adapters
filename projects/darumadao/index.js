const { ohmTvl } = require("../helper/ohm");

const {
  TREASURY_ADDRESS,
  STAKING_ADDRESS,
  SDRM_ADDRESS,
  USDC_ADDRESS,
  CKB_DRM_LP_ADDRESS,
  DRM_USDC_LP_ADDRESS,
  CKB_YOK_LP_ADDRESS,
} = require('./config')

const treasuryTokens = [
  [USDC_ADDRESS, false],
  [DRM_USDC_LP_ADDRESS, true],
  [CKB_DRM_LP_ADDRESS, true],
  [CKB_YOK_LP_ADDRESS, true],
]

const godwokenTransform = (token) => {
  token = token.toLowerCase()
  if (token === USDC_ADDRESS.toLowerCase())
    return '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC address on ethereum
  return token
}

module.exports = {
  misrepresentedTokens: true,
  ...ohmTvl(TREASURY_ADDRESS, treasuryTokens, "godwoken", STAKING_ADDRESS, SDRM_ADDRESS, godwokenTransform, undefined, false)
}
