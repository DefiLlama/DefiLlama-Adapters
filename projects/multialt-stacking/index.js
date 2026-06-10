const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const masterchef = "0xFFd33A71411fbA8B989Eca9F99EE7a908a2dEf4F";
const token_USDT = "0xb44a9b6905af7c801311e8f4e76932ee959c663c";
const token_USDC = "0xfa9343c3897324496a05fc75abed6bac29f8a40f";

module.exports = {
  kava: {
    tvl: sumTokensExport({
      owner: masterchef,
      tokens: [token_USDT, token_USDC]
    })
  }
}
