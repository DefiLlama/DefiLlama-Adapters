const { uniV3Export } = require('../helper/uniswapV3');

/**
 * Saydex Protocol - DefiLlama TVL Adapter
 * https://saydex.site
 *
 * Tracks Total Value Locked (TVL) across Saydex concentrated liquidity pools (Uniswap V3 architecture)
 * on supported Layer 2 networks.
 */

const config = {
  // Arbitrum One L2
  arbitrum: {
    factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    fromBlock: 165000000,
  },
  // Base L2 (Coinbase)
  base: {
    factory: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
    fromBlock: 2000000,
  },
  // OP Mainnet (Optimism)
  optimism: {
    factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    fromBlock: 100000000,
  },
  // Blast L2
  blast: {
    factory: '0x792EdAdE80af5fC680d96a2eD80A44247D1AF6Fd',
    fromBlock: 200000,
  },
  // GIWA L2 (Dunamu / Upbit Layer 2 - to be un-commented once GIWA chainId 91342 is added to @defillama/sdk)
  // giwa: {
  //   factory: '0xE9348e3e3c17D721575e294BE271BCD11028809e',
  //   fromBlock: 37300000,
  // },
};

module.exports = {
  methodology: 'Counts the tokens and liquidity locked in Saydex concentrated liquidity pools (Uniswap V3 architecture) across supported Layer 2 networks.',
  start: 1727000000,
  ...uniV3Export(config),
};
