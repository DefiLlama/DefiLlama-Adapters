const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const ZAMM_MAIN  = '0x00000000000008882D72EfA6cCE4B6a40b24C860'
const ZAMM_ORDER = '0x000000000000040470635EB91b7CE4D132D616eD'
const ZAMM_CURVE = '0x00000000007732aBAd9e86BDd0C3A270197EF2e1'      

module.exports = {
  methodology: 'Sums raw wei balance of ETH in zAMM.',
  start: '2025-04-27',
  ethereum: {
    tvl: sumTokensExport({
      owners: [ZAMM_MAIN, ZAMM_ORDER, ZAMM_CURVE],   
      tokens: [nullAddress],              
    }),
  },
}
