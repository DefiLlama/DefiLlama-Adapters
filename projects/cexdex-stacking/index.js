const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const token_USDC = "0xfa9343c3897324496a05fc75abed6bac29f8a40f";
const token_USDT = "0xb44a9b6905af7c801311e8f4e76932ee959c663c";
const masterchef = "0x451c3a3594aEB75EDcb13F132dc11D7d2972861A";

module.exports = {
  kava: {
    tvl: sumTokensExport({
      owner: masterchef,
      tokens: [token_USDC, token_USDT]
    })
  }
}
