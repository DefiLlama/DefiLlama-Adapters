const axios = require('axios')

const endpoint = "https://api.orca.so/pools"

async function fetch(){
    const pools = await axios.get(endpoint);
    return pools.data.reduce((sum, pool) => 
        sum + pool.liquidity
    , 0);
}

module.exports = {
    timetravel: false,
    fetch,
    hallmarks:[
        [1628565707, "Token+LM launch"]
    ]
}
