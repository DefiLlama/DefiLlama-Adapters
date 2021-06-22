const axios = require('axios')
const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const {transformPolygonAddress} = require('../helper/portedTokens')

const START_BLOCK = 4931780-1;
const FACTORY = '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32';

async function tvl(_, ethBlock, chainBlocks) {
  const transformPolygon = await transformPolygonAddress()
  const block = chainBlocks['polygon']
  const chain = 'polygon'

  const balances = await calculateUniTvl(transformPolygon, block, chain, FACTORY, START_BLOCK)
  delete balances['polygon:0x1c40ac03aacaf5f85808674e526e9c26309db92f']
  return balances
};

module.exports = {
  tvl,
};
