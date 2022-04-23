const utils = require('../helper/utils');

async function fetch() {
  let data = await utils.fetchURL('https://api.beluga.fi/tvl')
  return {polygon: data.data.Polygon, fantom: data.data.Fantom};
}

module.exports = {
  fetch
}
