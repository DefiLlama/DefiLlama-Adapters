const { sumTokensExport } = require("../helper/unwrapLPs");

const token_USDC = "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f";
const token_USDT = "0xB44a9B6905aF7c801311e8F4E76932ee959c663C";
const masterchef = "0x68DB81eAB568174D54F3fd0d9e035eDe9AAEd3e2";

module.exports = {
  kava: {
    tvl: sumTokensExport({
      owner: masterchef,
      tokens: [token_USDC, token_USDT, ]
    })
  }
}
