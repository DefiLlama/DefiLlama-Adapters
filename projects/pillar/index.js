const {fetchURL} = require('../helper/utils')

async function fetch(){
    const tvl = await fetchURL("https://api-launch.pillarprotocol.com/data/totalCollateral")
    return tvl.data.value/100
}

module.exports={
    fetch,
    timetravel: false,
}