// VectaSwap: a Uniswap V3 fork (byte-identical pools; factory emits the standard PoolCreated event).
// TVL = the token balances of every pool the factory created.
const { uniV3Export } = require('../helper/uniswapV3')

const factory = '0xe84FA17C2Ea423E0dea3C986EE3E1560D684bb2d' // same address on both chains

module.exports = uniV3Export({
  arbitrum: { factory, fromBlock: 518470299 },
  base: { factory, fromBlock: 53245146 },
})
