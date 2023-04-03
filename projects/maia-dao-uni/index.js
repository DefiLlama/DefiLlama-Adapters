const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  metis: { factory: '0xf5fd18Cd5325904cC7141cB9Daca1F2F964B9927', fromBlock: 5212263, eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)', topics: '0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118' },
})