const { get } = require('./helper/http')

async function fetch() {
  var response = await get('https://api.tulip.garden/tvl')

  return response.total;
}

module.exports = {
  hallmarks:[
    [1667865600, "FTX collapse"]
],
  timetravel: false,
  fetch
}
