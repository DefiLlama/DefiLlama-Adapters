const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

const GLINT_TOKEN = "0xcd3B51D98478D53F4515A306bE565c6EebeF1D58"
const SHARE_CONTRACT = "0x4204cAd97732282d261FbB7088e07557810A6408"

const dexTVL = getUniTVL({
  factory: "0x985BcA32293A7A496300a48081947321177a86FD",
  chain: "moonbeam",
  useDefaultCoreAssets: true,
})

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x985BcA32293A7A496300a48081947321177a86FD) is used to find the LP pairs. TVL is equal to the liquidity on the AMM & Staking balance is equal to the amount of GLINT staked within the SHARE token contract(0x4204cAd97732282d261FbB7088e07557810A6408)",
  moonbeam: {
    tvl: dexTVL,
    staking: staking(SHARE_CONTRACT, GLINT_TOKEN, 'moonbeam')
  },
};
