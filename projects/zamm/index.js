const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const ZAMM_MAIN   = '0x00000000000008882D72EfA6cCE4B6a40b24C860'
const ZAMM_ORDER = '0x000000000000040470635EB91b7CE4D132D616eD'   

module.exports = {
  methodology: 'Sums the raw wei balance of ETH held in the zAMM pool and zAMM orderbook contracts.',
  start: '2025-04-27',
  ethereum: {
    tvl: sumTokensExport({
      owners: [ZAMM_MAIN, ZAMM_ORDER],   
      tokens: [nullAddress],              
    }),
  },
}
