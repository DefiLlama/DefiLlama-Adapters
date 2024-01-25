const { nullAddress, sumTokensExport } = require('../helper/unwrapLPs')
const MINER_CONTRACT = "0x0754088499311a3FC2A9D2B759Dab2b6c0dB4A15"

module.exports = {
  bsc:{
    tvl: sumTokensExport({ tokens: [nullAddress], owner: MINER_CONTRACT, })
  },
  methodology: "We count the BNB on the Miner contract"
}