const { getConfig } = require('../helper/cache')

// const API_BASE = "https://api.metric.xyz";
const API_BASE = "http://54.199.103.16:8080";
const chainConfig = {
  ethereum: "ethereum",
  base: 'base',
  arbitrum: "arbitrum",
  bsc: "bsc",
  avax: "avax",
  polygon: "polygon",
  megaeth: "megaeth",
  hyperliquid: "hyperevm",
  monad: "monad",
};

Object.keys(chainConfig).forEach((key) => module.exports[key] = { tvl })

async function tvl(api) {
  const pools = await getConfig(`metric-pools/${api.chain}`, `${API_BASE}/${chainConfig[api.chain]}/metadata`)
  const ownerTokens = pools.map(i => [[i.token0, i.token1], i.poolAddress])
  return api.sumTokens({ ownerTokens })
}