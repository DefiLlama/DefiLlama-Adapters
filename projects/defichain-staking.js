const utils = require('./helper/utils');

async function fetch() {
  const { data } = await utils.fetchURL('https://ocean.defichain.com/v0/mainnet/stats')
  return data.data.tvl.masternodes;
}

module.exports = {
  methodology: "Liquidity on the Staking",
  fetch
}
