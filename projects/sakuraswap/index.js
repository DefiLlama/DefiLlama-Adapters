const { uniTvlExports } = require('../helper/unknownTokens')
const { uniV3Export } = require('../helper/uniswapV3')
const { mergeExports } = require('../helper/utils')

// Uniswap V2 Factory Addresses
const v2Factories = {
  abstract: '0x566d7510dEE58360a64C9827257cF6D0Dc43985E',
  zero_network: '0x1B4427e212475B12e62f0f142b8AfEf3BC18B559',
}

// Uniswap V3 Factory Addresses
const v3Config = {
  abstract: { factory: '0xA1160e73B63F322ae88cC2d8E700833e71D0b2a1', fromBlock: 1 },
  zero_network: { factory: '0xA1160e73B63F322ae88cC2d8E700833e71D0b2a1', fromBlock: 1 },
}

module.exports = mergeExports([
  uniTvlExports(v2Factories),
  uniV3Export(v3Config),
])

module.exports.methodology = 'TVL is calculated by summing the liquidity in all SakuraSwap V2 and V3 pools across supported chains.'
