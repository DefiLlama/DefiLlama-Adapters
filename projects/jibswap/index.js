const sdk = require('@defillama/sdk')
const { uniTvlExport } = require('../helper/calculateUniTvl.js')

const FACTORY = '0x4BBdA880C5A0cDcEc6510f0450c6C8bC5773D499'

module.exports = {
  jibchain: {
    tvl: uniTvlExport(FACTORY, 'jibchain')
  },
  methodology: "Includes liquidity on all the pools on the uniswap fork",
}
