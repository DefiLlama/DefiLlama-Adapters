const utils = require('../helper/utils');

async function polygon() {
  const tvl = await utils.fetchURL('https://api.mobius.finance/tvl/')
  return tvl.data
}

async function fetch() {
  return await polygon()
}
module.exports = {
  polygon:{
    fetch:polygon
  },
  fetch
}