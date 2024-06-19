const utils = require('../helper/utils');
const totlaTvlEndpoint = "https://app-staging.solayer.org/api/total_tvl"

async function tvl() {
  const totalTvl = await utils.fetchURL(totlaTvlEndpoint)
  const totalTvlValue = parseFloat(totalTvl.data);
  return totalTvlValue
}

module.exports = {
  timetravel: false,
  solana:{
    fetch: tvl
  },
  methodology: 'TVL consists of deposits made to the protocol',
}
