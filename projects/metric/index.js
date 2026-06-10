const { uniV3Export } = require('../helper/uniswapV3');

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
  monad: 64807339,
}

module.exports = uniV3Export(
  Object.fromEntries(
    Object.entries(fromBlocks).map(([chain, fromBlock]) => [chain, { factory, eventAbi, fromBlock }])
  )
)