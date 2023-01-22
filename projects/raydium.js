const { get } = require('./helper/http')
const sdk = require('@defillama/sdk')

async function fetch() {
  const response = await get("https://api.raydium.io/pairs");

  return response.reduce((a, b) => {
    if (b.amm_id === "5UCve2rYxMTe2xyCoqREsMXoTCCqr57XpnDsPq45r9dc") return a;
    if (b.liquidity > 1e8) sdk.log(b);
    return a + b.liquidity;
  }, 0);
}

module.exports = {
  hallmarks: [[1667865600, "FTX collapse"]],
  timetravel: false,
  fetch,
};
