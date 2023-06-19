const ADDRESSES = require('../helper/coreAssets.json')
const marginPool = "0x30ae5debc9edf60a23cd19494492b1ef37afa56d";
const WETH = ADDRESSES.polygon.WETH_1;
const collateralAssets = ['0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  ADDRESSES.polygon.USDC,
  ADDRESSES.polygon.WBTC, WETH, ]

const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = sumTokensExport({ owner: marginPool, tokens: collateralAssets})
