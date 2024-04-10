const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  methodology: `Uses factory(0xA9a6E17a05c71BFe168CA972368F4b98774BF6C3) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
  findora: {
    tvl: getUniTVL({ factory: '0xA9a6E17a05c71BFe168CA972368F4b98774BF6C3', useDefaultCoreAssets: true }),
  },
};