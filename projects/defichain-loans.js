const utils = require('./helper/utils');

async function fetch() {
  const { data } = await utils.fetchURL('https://ocean.defichain.com/v0/mainnet/stats')
  return data.data.tvl.loan;
}

module.exports = {
  methodology: "Collateral backing loans in the platform",
  fetch
}
