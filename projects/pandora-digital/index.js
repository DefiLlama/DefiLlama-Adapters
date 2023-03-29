const {uniTvlExport} = require('../helper/calculateUniTvl.js')

const PANDORA_FACTORY = "0xFf9A4E72405Df3ca3D909523229677e6B2b8dC71"

module.exports = {
  bsc:{
    tvl: uniTvlExport(PANDORA_FACTORY, 'bsc'),
  },
  methodology: "The TVL is the total of all liquidity pools on Pandora DEX",
}