
const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  europa: { tvl: getUniTVL({
    factory: '0xc318a82CB7c2B0faf7e355BB8F285016956aBF55',
    useDefaultCoreAssets: true,
  }),},
}
