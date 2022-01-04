const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const {transformPolygonAddress} = require('../helper/portedTokens')

const FACTORY = '0xEAA98F7b5f7BfbcD1aF14D0efAa9d9e68D82f640';

async function tvl(_, ethBlock, chainBlocks) {
  const transformPolygon = await transformPolygonAddress()// addr=>`polygon:${addr}`
  const block = chainBlocks['polygon']
  const chain = 'polygon'
  const balances = await calculateUniTvl(transformPolygon, block, chain, FACTORY, 16125888, true)
  return balances
};

module.exports = {
  tvl
};
