const utils = require('../helper/utils');

async function meter() {
  const tvl = await utils.fetchURL('https://api.0xtracker.app/voltswap_tvl/meter')
  return tvl.data.data.totalUSD
}

async function theta() {
  const tvl = await utils.fetchURL('https://api.0xtracker.app/voltswap_tvl/theta')
  return tvl.data.data.totalUSD
}

async function fetch() {
  return (await meter())+(await theta())
}



module.exports = {
  timetravel: false,
  meter:{
    fetch: meter
  },
  theta:{
    fetch: theta
  },
  fetch
}
