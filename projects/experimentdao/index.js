const retry = require('async-retry')
const utils = require('../helper/utils');

async function getData() {
  const res = await retry(async bail => await utils.fetchURL('https://vite-api.thomiz.dev/tvl/experimentdao'))
  return res.data;
}

async function fetchTVL() {
    const data = await getData()
    return data.tvl
  }

module.exports = {
  vite: {
    fetch: fetchTVL
  },
  fetch: fetchTVL
}