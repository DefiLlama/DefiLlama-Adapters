const sdk = require('@defillama/sdk')
const { getUniTVL } = require('../helper/unknownTokens')
const { uniV3Export } = require('../helper/uniswapV3')

// Architect Swap: the Uniswap V2 and V3 deployment of the NLYRA ecosystem on Robinhood Chain.
// Both factories are verified on the Robinhood Chain explorer and listed in https://nlyra.xyz/docs
const V2_FACTORY = '0xfa6253ee74F7956b022998F7bfa271990C8A82a8' // UniswapV2Factory, deployed at block 21868607
const V3_FACTORY = '0x3FdaBf7AB5d871B89F1d9DA04Dc2E0733dB70CaF' // UniswapV3Factory, deployed at block 22361711

const v3 = uniV3Export({ robinhood: { factory: V3_FACTORY, fromBlock: 22361711 } })

module.exports = {
  methodology: 'TVL is the value of the tokens held in the Architect Swap pools: V2 pairs created by the V2 factory and V3 pools created by the V3 factory on Robinhood Chain.',
  robinhood: {
    tvl: sdk.util.sumChainTvls([
      getUniTVL({ factory: V2_FACTORY, useDefaultCoreAssets: true }),
      v3.robinhood.tvl,
    ]),
  },
}
