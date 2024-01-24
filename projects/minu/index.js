const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const MINER_CONTRACT = "0x0754088499311a3FC2A9D2B759Dab2b6c0dB4A15"

async function tvl(_, _1, _2, { bsc: block }) {
  return sumTokens2({ tokens: [nullAddress], owner: MINER_CONTRACT, block, chain: 'bsc', })

}

module.exports = {

  bsc:{
    tvl
  },
  methodology: "We count the BNB on the Miner contract"
}