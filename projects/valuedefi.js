const utils = require('./helper/utils');

async function fetch() {
  let response = await utils.fetchURL('https://api-stats.valuedefi.io/api/common-stat/get-total-locked')
  return response.data.data.total
}

async function eth() {
  let response = await utils.fetchURL('https://api-stats.valuedefi.io/api/common-stat/get-total-locked')
  return response.data.data.ethTotal
}

async function bsc() {
  let response = await utils.fetchURL('https://api-stats.valuedefi.io/api/common-stat/get-total-locked')
  return response.data.data.bscTotal
}


module.exports = {
  ethereum:{
    fetch: eth,
  },
  bsc: {
    fetch: bsc
  },
  fetch,
  methodology: `TVL for ValueDefi is obtained from the ValueDefi API:'https://api-stats.valuedefi.io/api/common-stat/get-total-locked'.`
};
