const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  onus: {
    tvl: getUniTVL({  factory: '0xA5DA4dC244c7aD33a0D8a10Ed5d8cFf078E86Ef3', useDefaultCoreAssets: true, blacklistedTokens: [
      '0xa6b9579563a48a0540bb53853ae0947972371169', // VNDC - minted by team
      '0xff276c6bca1f66fd54a8915e830735d6ab0c7b09', // USDT - minted by team
    ] }),
  }
}