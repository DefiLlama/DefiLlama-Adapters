// const retry = require("./helper/retry")
const retry = require("async-retry");
const axios = require("axios");

async function NRtvl() {
  const response = await retry(
    async (bail) => await axios.get("https://core.neuronswap.com/api/dashboard")
  );

  return response.data.data.totalLp.toFixed(2);
}
NRtvl();
async function stakedNR() {
  const response = await retry(
    async (bail) => await axios.get("https://core.neuronswap.com/api/dashboard")
  );

  return response.data.data.totalStakedNeuronPrice.toFixed(2);
}
stakedNR();
module.exports = {
  methodology: `Tvl counts the tokens locked on AMM pools and staking counts the NR that has been staked. Data is pulled from the 'https://core.neuronswap.com/api/dashboard'`,
  klaytn: {
    tvl: NRtvl,
    staking: stakedNR,
  },
  timetravel: false,
};
