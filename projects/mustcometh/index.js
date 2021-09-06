const {calculateUniTvl} = require('../helper/calculateUniTvl.js')

const FACTORY = "0x800b052609c355cA8103E06F022aA30647eAd60a";

async function tvl(timestamp, block, chainBlocks) {
  return calculateUniTvl(addr=>`polygon:${addr}`, chainBlocks['polygon'], 'polygon', FACTORY, 0, true);
}


module.exports = {
  misrepresentedTokens: true,
  tvl
}