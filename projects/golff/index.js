const axios = require('axios')


const url = "https://www.golff.com/api/v2/tvl/tvl_info";

async function fetch(){
    const tvlInfo = await axios.get(url);
    return parseInt(tvlInfo.data.data.ether) + parseInt(tvlInfo.data.data.heco) + parseInt(tvlInfo.data.data.bsc);
}

module.exports = {
    fetch
}