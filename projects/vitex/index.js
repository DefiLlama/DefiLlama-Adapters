const retry = require('async-retry')
const utils = require('../helper/utils');

async function getData() {
  const res = await retry(async bail => await utils.fetchURL('https://vite-info-api.xvite.workers.dev/'))
  return res.data;
}

async function vitex() {
  const data = await getData()
  return data.tvlRankings.filter((i) => {
    return i.name == 'ViteX'
  })[0].amount
}

async function fetch() {
  const data = await getData()
  return data.tvl
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  vite:{
    fetch: vitex
  },
  fetch: vitex
}