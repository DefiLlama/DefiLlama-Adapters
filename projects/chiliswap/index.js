const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools',
  scroll: {
    tvl: getUniTVL({  factory: "0x2627161e60fFa589f8bD3798F0947d572A7EdF68", useDefaultCoreAssets: true })
  }
}