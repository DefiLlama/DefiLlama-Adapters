
const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  europa: { tvl: getUniTVL({
    factory: '0x71f7BbbB33550fa5d70CA3F7eeAD87529f2DC3C8',
    useDefaultCoreAssets: true,
  }),},
}
