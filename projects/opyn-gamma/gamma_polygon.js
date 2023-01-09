const marginPool = "0x30ae5debc9edf60a23cd19494492b1ef37afa56d";
const WETH = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
const collateralAssets = ['0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
  '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', WETH, ]

const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = sumTokensExport({ owner: marginPool, tokens: collateralAssets})
