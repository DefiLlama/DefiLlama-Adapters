const { masterchefExports, } = require("../helper/unknownTokens")

const token = "0xd74433b187cf0ba998ad9be3486b929c76815215";
const masterchef = "0x59c777cd749b307be910f15c54a3116ff88f9706";

module.exports = masterchefExports({
  chain: 'harmony',
  useDefaultCoreAssets: true,
  masterchef,
  nativeToken: token,
  blacklistedTokens: [
    '0xed0b4b0f0e2c17646682fc98ace09feb99af3ade', // RVRS bad pricing
  ]
})