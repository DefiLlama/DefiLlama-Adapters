const { uniV3Export } = require('../helper/uniswapV3');
const { getConfig } = require('../helper/cache')

const factory = '0xe22F9fc0f04486dE25ed6CF1800a4a47aFD82e0C';
const eventAbi = 'event PoolCreated(address indexed token0, address indexed token1, address indexed manager, address pool, bytes32 poolKey)';

const fromBlocks = {
  ethereum: 24521185,
  base: 42540736,
  arbitrum: 435210755,
  bsc: 82964761,
  avax: 78822864,
  polygon: 83380134,
  megaeth: 9083666,
  hyperliquid: 30774348,
  // monad: 64807339,
}

// getLogs2 is failing on monad
async function tvl(api) {
    // const API_BASE = 'https://api.metric.xyz';
    const API_BASE = 'http://54.199.103.16:8080';
    const pools = await getConfig(`metric.xyz-pools-${api.chain}`, `${API_BASE}/${api.chain}/metadata`);
    const ownerTokens = pools.map((p) => [[p.token0, p.token1], p.poolAddress])

    await api.sumTokens({ownerTokens})
}

module.exports = uniV3Export(
  Object.fromEntries(
    Object.entries(fromBlocks).map(([chain, fromBlock]) => [chain, { factory, eventAbi, fromBlock }])
  )
)

module.exports.monad = {tvl}