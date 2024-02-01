const { unknownTombs, } = require('../helper/unknownTokens')

const chain = 'dogechain'
const token = "0xB483CbF402eF2B07060544e4aA4c5690fea32B12";
const shares = "0xc90163b8d53F319AbE68dd1d8ecC025c72eB3f04";
const shareRewardPool = "0xb015d1D4F846D44A699F5648071496D1eC99C4C5";
const masonry = "0x0eD8cFA5Bd631263CFAb290E12e2559af1252Ed6";

const lps = [
  '0x517ae0a15932A57D27cE26AE97f5F9Dbc6823907',  // COWAII-WDOGE LP
  '0x2b779C9Ed23bb315911EEE910bc3FfAbFfB776bB',  // MILK-WDOGE LP
  // "0x77A86d9c3A7689cD6577a6FC433a19f7c1686198", // MILK-WWDOGE LP 
  // "0xe0d79F5Bc8e86E9123cA14937ca791128D013130", // COWAII-WWDOGE LP
]
module.exports = unknownTombs({
  lps,
  token,
  shares: [shares],
  rewardPool: [shareRewardPool,],
  masonry: [masonry],
  chain,
  useDefaultCoreAssets: true,
})

module.exports.misrepresentedTokens = true
