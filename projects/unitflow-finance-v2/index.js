const { getUniTVL } = require('../helper/unknownTokens')

// Unitflow "v2.5" is a Uniswap v2 fork; pairs are enumerated from the factory, no log scan needed.
// Folder is dot-free on purpose: the test harness skips paths whose last segment has an extension.
module.exports = {
  methodology: 'Token balances held in every Unitflow v2.5 pair, enumerated from the factory.',
  arc: { tvl: getUniTVL({ factory: '0xFc1EC6761e246D5cb0c4C22669f8635098B22ba1', useDefaultCoreAssets: true }) },
}
