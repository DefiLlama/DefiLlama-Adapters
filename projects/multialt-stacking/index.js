const { sumTokensExport } = require("../helper/unwrapLPs");

const masterchef = "0xFFd33A71411fbA8B989Eca9F99EE7a908a2dEf4F";
const token_USDT = "0xB44a9B6905aF7c801311e8F4E76932ee959c663C";
const token_USDC = "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f";

module.exports = {
  kava: {
    tvl: sumTokensExport({
      owner: masterchef,
      tokens: [token_USDT, token_USDC]
    })
  }
}
