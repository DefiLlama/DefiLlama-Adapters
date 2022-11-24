const retry = require('./helper/retry')
const axios = require("axios");

async function fetch() {
  var response = await retry(async bail => await axios.get('https://api.solfarm.io/tvl'))

  return response.data.TOTAL;
}

module.exports = {
  hallmarks:[
    [1667865600, "FTX collapse"]
],
  timetravel: false,
  fetch
}
