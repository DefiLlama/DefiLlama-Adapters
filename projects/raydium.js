const { get } = require("./helper/http");
const sdk = require("@defillama/sdk");

async function fetch() {
  const response = await get("https://api.raydium.io/pairs");
  return response.reduce((a, b) => {
    if (
      [
        "5UCve2rYxMTe2xyCoqREsMXoTCCqr57XpnDsPq45r9dc",
        "7MeQyLVRr4FL2aDFm9R6WBchdWJaMgNJCqhzbwziCPd8",
      ].includes(b.amm_id)
    )
      return a;
    if (b.liquidity > 1e8) sdk.log(b);
    return a + b.liquidity;
  }, 0);
}

module.exports = {
  hallmarks: [[1667865600, "FTX collapse"]],
  timetravel: false,
  fetch,
};
// node test.js projects/raydium.js
