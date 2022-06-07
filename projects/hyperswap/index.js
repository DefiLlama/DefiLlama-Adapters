const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const {transformFantomAddress} = require('../helper/portedTokens')

const FACTORY = "0x991152411A7B5A14A8CF0cDDE8439435328070dF";

async function tvl(timestamp, block, chainBlocks) {
  const transform = await transformFantomAddress()
  return calculateUniTvl(transform, chainBlocks['fantom'], 'fantom', FACTORY, 0, true);
}

module.exports={
  methodology: "Liquidity on DEX pools",
  tvl
}