const ADDRESSES = require('../helper/coreAssets.json')
const { masterchefExports, } = require("../helper/unknownTokens")

const token = ADDRESSES.harmony.MIS;
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