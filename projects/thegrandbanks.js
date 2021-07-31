const utils = require('./helper/utils');

const bscEndpoint = "https://www.thegrandbanks.finance/api/tvl"

async function bsc() {
  const data = await utils.fetchURL(bscEndpoint)
  return data.data.tvl
}

async function fetch() {
  return await bsc()
}

module.exports = {
  bsc: {
    fetch: bsc
  },
  fetch
}
