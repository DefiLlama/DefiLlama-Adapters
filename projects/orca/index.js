const { get } = require('../helper/http')

const endpoint = "https://api.orca.so/pools";
const wpEndpoint = "https://api.mainnet.orca.so/v1/whirlpool/list";

async function fetch() {
    const [pools, {whirlpools}] = await Promise.all([get(endpoint), get(wpEndpoint)]);
    const poolsTvl = pools.reduce((sum, pool) =>
        sum + pool.liquidity
    , 0);
    const wpTvl = whirlpools.reduce((sum, pool) =>
        sum + (pool.tvl ?? 0)
    , 0);
    return poolsTvl + wpTvl;
}

module.exports = {
    timetravel: false,
    fetch,
    hallmarks:[
        [1628565707, "Token+LM launch"],
        [1667865600, "FTX collapse"]
    ]
};
