const { default: axios } = require("axios")

async function fetch(){
    const tvl = (await axios.post("https://dex-api.adax.pro/", {"endpoint":"getStatistics"})).data
    return tvl[0].tvl_usd
}

module.exports={
    methodology: "Data is retrieved from the api at https://dex-api.adax.pro/",
    timetravel: false, // but there's historical data, this can be changed!
    fetch
}