const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  polygon: {
    tvl: sumTokensExport({
      tokens: [
        '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH
        '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI
        '0x0000000000000000000000000000000000001010', // MATIC
        '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8', // aWETH
        '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE', // aDAI
        '0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97', // aMATIC
      ],
      owner: '0x03ebC6d159C41419747354bc819dF274Da9948B5'
    }),
  },
}