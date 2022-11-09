const retry = require('async-retry')
const utils = require('../helper/utils');

async function getData() {
  const res = await retry(async bail => await utils.fetchURL('https://vite-api.thomiz.dev/tvl/vitcswap'))
  return res.data;
}

async function fetch() {
  const data = await getData()
  return data.tvl
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  vite:{
    fetch: fetch
  },
  fetch: fetch
}