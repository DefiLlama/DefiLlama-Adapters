const utils = require('../helper/utils');

async function fetch() {
    var data = await utils.fetchURL('https://s.belt.fi/info/all.json')
    let bscTvl = data.data.info.beltStat.tvl.bsc
    let hecoTvl = data.data.info.beltStat.tvl.heco
    let tvl = Number(bscTvl) + Number(hecoTvl)
    return tvl;
}

module.exports = {
  fetch
}