axios = require("axios");

const NEURON_FUND_URL = "https://ic-api.internetcomputer.org/api/v3/metrics/community-fund-total-staked?step=7200"

async function tvl() {
  const { api } = arguments[2]
    var { data, status } = await axios.get(
      NEURON_FUND_URL      ,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );
  let neuron_fund_balance = data.community_fund_total_staked[0][1];
  api.add('coingecko:icp', neuron_fund_balance / 1e8)
}

module.exports = {
  methodology: `We count the ICP locked inside the Neurons of the Neurons Fund`,
  icp: { tvl: {coingecko: tvl }},
}