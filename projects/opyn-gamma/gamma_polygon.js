const ADDRESSES = require('../helper/coreAssets.json')
const marginPool = "0x30ae5debc9edf60a23cd19494492b1ef37afa56d";
const WETH = ADDRESSES.polygon.WETH_1;
const collateralAssets = [ADDRESSES.polygon.WMATIC_2,
  ADDRESSES.polygon.USDC,
  ADDRESSES.polygon.WBTC, WETH, ]

const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = sumTokensExport({ owner: marginPool, tokens: collateralAssets})
