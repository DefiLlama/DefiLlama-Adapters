const axios = require('axios');

const endpoint = "https://api.orca.so/pools";
const wpEndpoint = "https://mainnet-zp2-v2.orca.so/pools";

async function fetch() {
    const [pools, whirlpools] = await Promise.all([axios.get(endpoint), axios.get(wpEndpoint)]);
    const poolsTvl = pools.data.reduce((sum, pool) =>
        sum + pool.liquidity
    , 0);
    const wpTvl = whirlpools.data.reduce((sum, pool) =>
        sum + pool.tvl
    , 0);
    return poolsTvl + wpTvl;
}

module.exports = {
    timetravel: false,
    fetch,
    hallmarks:[
        [1628565707, "Token+LM launch"]
    ]
};
