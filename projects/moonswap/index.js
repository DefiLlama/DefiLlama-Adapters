const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  moonriver: {
    tvl: getUniTVL({
      chain: 'moonriver',
      factory: '0x056973f631a5533470143bb7010c9229c19c04d2',
      coreAssets: [
        '0xf50225a84382c74CbdeA10b0c176f71fc3DE0C4d', // moonriver
        "0xb44a9b6905af7c801311e8f4e76932ee959c663c", // usdt
        "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d", // usdc
        "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c", // eth
      ],
      blacklist: [
        '0xfd301ca82d007880e678bb750a771550c5104ff2', // ANKR, bad decimal?
      ]
    })
  },
  misrepresentedTokens: true,
} // node test.js projects/moonswap/index.js