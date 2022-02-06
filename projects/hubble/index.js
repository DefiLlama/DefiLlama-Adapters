const axios = require("axios");
const HUBBLE_API = "https://api.hubbleprotocol.io";

const client = axios.create({
  baseURL: HUBBLE_API,
});

function exports() {
  return async () => {
    const metrics = await client.get("/metrics");
    const stakings = metrics.data.hbb.staked * metrics.data.hbb.price;

    const staking = () => { stakings };
    const tvl = () => { metrics.data.totalValueLocked - stakings };

    return {
      methodology: `To obtain the Hubble Protocol TVL we use the formula 'TVL = Total HBB Staked * Current HBB Price + Total Collateral Value + Total Stablecoin (USDH) in Stability Pool'.`,
      fetch: tvl,
      staking: {
        fetch: staking,
      },
      fetch: tvl
    };
  }
}
// node test.js projects/hubble/index.js
module.exports = exports;
