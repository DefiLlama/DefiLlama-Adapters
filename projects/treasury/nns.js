const { get } = require('../helper/http')

const NEURON_FUND_URL = "https://ic-api.internetcomputer.org/api/v3/metrics/community-fund-total-staked?step=7200"

async function tvl(api) {
  var data = await get(NEURON_FUND_URL);
  let neuron_fund_balance = parseInt(data.community_fund_total_staked[0][1]);
  console.log(neuron_fund_balance)
  api.addCGToken('internet-computer', neuron_fund_balance / 1e8)
}

module.exports = {
  methodology: `We count the ICP locked inside the Neurons of the Neurons Fund`,
  icp: {
    tvl
  },
}