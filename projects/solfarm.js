const { get } = require('./helper/http')

async function fetch() {
  var response = await get('https://api.solfarm.io/tvl')

  return response.TOTAL;
}

module.exports = {
  hallmarks:[
    [1667865600, "FTX collapse"]
],
  timetravel: false,
  fetch
}
