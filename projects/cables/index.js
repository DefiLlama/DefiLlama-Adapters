const { cexExports } = require('../helper/cex')

const config = {
  avax: {
    owners: [
       '0xfA12DCB2e1FD72bD92E8255Db6A781b2c76adC20',
    ],
    tokens: [
      "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", // WAVAX
      "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be", // SAVAX
      "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e", // USDC
      "0xc891eb4cbdeff6e073e859e987815ed1505c2acd", // EURC
      "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", // DAI
      "0xc7198437980c041c805a1edcba50c1ce5db95118", // USDt_e
      "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7", // USDt
      "0x152b9d0fdc40c096757f570a51e494bd4b943e50", // BTC_b
      "0x50b7545627a5162F82A992c33b87aDc75187B218", // WBTC_e
      "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664", // USDC_e
    ]
  },
  arbitrum: {
    owners: [
      '0xfA12DCB2e1FD72bD92E8255Db6A781b2c76adC20',
    ],
    tokens: [
      "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", // WBTC
      "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", // DAI
      "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
      "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC_CIRCLE
      "0xf97f4df75117a78c1a5a0dbb814af92458539fb4", // LINK
      "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
      "0x09ad12552ec45f82be90b38dfe7b06332a680864", // ARBY
      "0x912ce59144191c1204e64559fe8253a0e49e6548", // ARB
      "0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a", // MIM
      "0xdbf31df14b66535af65aac99c32e9ea844e14501", // renBTC
      "0x31635a2a3892daec7c399102676e344f55d20da7", // DFL
      "0x4a717522566c7a09fd2774ccedc5a8c43c5f9fd2", // FEI
      "0x2913e812cf0dcca30fb28e6cac3d2dcff4497688", // nUSD
      "0x289ba1701c2f088cf0faf8b3705246331cb8a839", // LPT
      "0x61a1ff55c5216b636a294a07d77c6f4df10d3b56", // APEX
      "0x93c15cd7de26f07265f0272e0b831c5d7fab174f", // LIQD
      "0x1addd80e6039594ee970e5872d247bf0414c8903", // fsGLP
      "0x4e971a87900b931ff39d1aad67697f49835400b6", // fGLP
      "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a", // GMX
      "0x5979D7b546E38E414F7E9822514be443A4800529", // WSTETH
      "0x5326e71ff593ecc2cf7acae5fe57582d6e74cff1", // plvGLP
      "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34", // USDe
      "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F"  // FRAX
    ]
  }
}

module.exports = cexExports(config)