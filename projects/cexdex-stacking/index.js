const { sumTokensExport } = require("../helper/unwrapLPs");

const token_USDC = "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f";
const token_USDT = "0xB44a9B6905aF7c801311e8F4E76932ee959c663C";
const masterchef = "0x451c3a3594aEB75EDcb13F132dc11D7d2972861A";

module.exports = {
  kava: {
    tvl: sumTokensExport({
      owner: masterchef,
      tokens: [token_USDC, token_USDT]
    })
  }
}
