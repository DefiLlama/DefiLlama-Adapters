const sdk = require("@defillama/sdk");
const {calculateUniTvl} = require('../helper/calculateUniTvl.js')

const PANDORA_FACTORY = "0xFf9A4E72405Df3ca3D909523229677e6B2b8dC71"

async function bscTvl(timestamp, block, chainBlocks) {
  return calculateUniTvl(addr=>`bsc:${addr}`, chainBlocks['bsc'], 'bsc', PANDORA_FACTORY, 0, true);
}

module.exports = {
  misrepresentedTokens: true,
  bsc:{
    tvl: bscTvl
  },
  methodology: "The TVL is the total of all liquidity pools on Pandora DEX",
}