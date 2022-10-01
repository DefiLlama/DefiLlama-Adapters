const { getUniTVL } = require('../helper/unknownTokens')
const sdk = require("@defillama/sdk");

const dexTVL = getUniTVL({
  factory: '0x6B6071Ccc534fcee7B699aAb87929fAF8806d5bd',
  chain: 'moonriver',
  coreAssets: [
    '0xf50225a84382c74CbdeA10b0c176f71fc3DE0C4d', // moonriver
    "0x98878B06940aE243284CA214f92Bb71a2b032B8A", // WMOVR
    "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d", // usdc
    "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c", // eth
  ]
})

module.exports = {
  misrepresentedTokens: true,
  moonriver: {
    tvl: sdk.util.sumChainTvls([dexTVL]),
  }
}
