const axios = require('axios')


async function fetch() {
    let tvl = await axios.get('http://depth.fi/api/getTotalTvl')
    return tvl.data.Data.TotalTvl;
}

module.exports = {
    fetch
}
