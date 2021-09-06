const utils = require('./helper/utils');

async function fetch() {
  var totalTvl = await utils.fetchURL('https://wandora.finnexus.app/api/phx/tvl')
  return totalTvl.data.totaltvl;
}

async function polygon() {
  var totalTvl = await utils.fetchURL('https://wandora.finnexus.app/api/phx/tvl')
  return totalTvl.data.polytvl;
}

async function bsc() {
    var totalTvl = await utils.fetchURL('https://wandora.finnexus.app/api/phx/tvl')
    return totalTvl.data.bsctvl;
}

async function wan() {
  var totalTvl = await utils.fetchURL('https://wandora.finnexus.app/api/phx/tvl');
  return totalTvl.data.wantvl;
}

module.exports = {
  polygon: {
    fetch: polygon
  },
  bsc: {
     fetch: bsc
  },
  wan: {
     fetch: wan
  },
  fetch
}
