axios = require("axios");

const NEURON_FUND_URL = "https://ic-api.internetcomputer.org/api/v3/metrics/community-fund-total-staked?step=7200"

async function tvl() {

    var { data, status } = await axios.get(
      NEURON_FUND_URL      ,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );
  let neuron_fund_balance = data.community_fund_total_staked[0][1];
  return neuron_fund_balance;
}

module.exports = {
  methodology: `We count the ICP locked inside the Neurons of the Neurons Fund`,
  icp: { tvl: tvl },
}