const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

const GLINT_TOKEN = ADDRESSES.moonbeam.GLINT
const SHARE_CONTRACT = "0x4204cAd97732282d261FbB7088e07557810A6408"
const STGLINT_CONTRACT = "0x63d43D0EDda7DE4B5ed9B2F2AA855f81FBd71697"

const dexTVL = getUniTVL({
  factory: "0x985BcA32293A7A496300a48081947321177a86FD",
  useDefaultCoreAssets: true,
})

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x985BcA32293A7A496300a48081947321177a86FD) is used to find the LP pairs. TVL is equal to the liquidity on the AMM & Staking balance is equal to the amount of GLINT staked within the SHARE token contract(0x4204cAd97732282d261FbB7088e07557810A6408) - deprecated and stGLINT contract(0x63d43D0EDda7DE4B5ed9B2F2AA855f81FBd71697)",
  moonbeam: {
    tvl: dexTVL,
    staking: staking([SHARE_CONTRACT, STGLINT_CONTRACT], GLINT_TOKEN)
  },
};
