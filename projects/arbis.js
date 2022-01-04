const { fetchURL } = require('./helper/utils')

const endpoint = "https://horseysauce.xyz/"

async function fetch(){
    const data = await fetchURL(endpoint)
    return Number(data.data.tvl)
}

module.exports={
    fetch
}