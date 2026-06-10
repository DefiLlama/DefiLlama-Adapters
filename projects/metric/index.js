const { getConfig } = require('../helper/cache')

// const API_BASE = "https://api.metric.xyz";
const API_BASE = "http://54.199.103.16:8080";

const chains = ['ethereum', 'base', 'arbitrum', 'bsc', 'avax', 'polygon', 'megaeth', 'hyperliquid', 'monad'];

async function tvl(api) {
    const chain = api.chain == 'hyperliquid' ? 'hyperevm' : api.chain
    const pools = await getConfig(`metric.xyz-pools-${chain}`, `${API_BASE}/${chain}/metadata`);
    const ownerTokens = pools.map((p) => [[p.token0, p.token1], p.poolAddress])

    await api.sumTokens({ownerTokens})
}


module.exports = {
    methodology: 'Counts all tokens across all metric pools.'
}

chains.forEach(chain => {
    module.exports[chain] = {tvl}
})