const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress, } = require("../helper/unwrapLPs.js");

const eth = {
  weth: ADDRESSES.ethereum.WETH,
  arth: "0x8CC0F052fff7eaD7f2EdCCcaC895502E884a8a71",
  treasury: "0x43c958affe41d44f0a02ae177b591e93c86adbea",
};

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: eth.treasury, tokens: [eth.weth, nullAddress] }),
    ownTokens: sumTokensExport({ owner: eth.treasury, tokens: [eth.arth,] }),
  }
};
