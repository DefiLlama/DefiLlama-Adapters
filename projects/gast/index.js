const { sumTokens2, } = require('../helper/unwrapLPs')

module.exports = {
  btr: {
    tvl: async api => {
      return sumTokens2({
        owners: [
          '0xcc92b570ef8117af0ed2ec294f635b70644f13ea', // gast-wbtc lp
        ], tokens: ['0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f'], api,
      }) //wbtc
    },
  },
  arbitrum: {
    tvl: async api => {
      return sumTokens2({
        owners: [
          '0xbd7d96b4598E22eC5302232F6e7870a2d095CAcA', // gast-usdt lp
        ], tokens: ['0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'], api,
      }) //usdt
    },
  }
}