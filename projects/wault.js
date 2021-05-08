const axios = require('axios')

async function fetch() {
  let bsc = await axios.get('https://api.wault.finance/waultTotalValueLocked.json')
  return bsc.data.protocolTvl;
}
fetch().then(console.log)

module.exports = {
  fetch
}
