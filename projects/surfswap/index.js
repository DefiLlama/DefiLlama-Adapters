const { getUniTVL } = require('../helper/unknownTokens')

const dexTVL = getUniTVL({
  factory: "0xc449665520C5a40C9E88c7BaDa149f02241B1f9F",
  useDefaultCoreAssets: true,
})

module.exports = {
  hallmarks: [
    [1660521600, "incentives not given"]
  ],
  misrepresentedTokens: true,
  kava: {
    tvl:dexTVL,
  }
}
