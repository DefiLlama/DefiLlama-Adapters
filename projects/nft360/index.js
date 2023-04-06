const { sumTokensExport } = require("../helper/unwrapLPs");

const token_USDC = "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f";
const masterchef = "0x061362b6c0676fA9995A15D7fFcaef0323A9dF2F";

module.exports = {
  kava: {
    tvl: sumTokensExport({
      owner: masterchef,
      tokens: [token_USDC, token_USDT]
    })
  }
}
