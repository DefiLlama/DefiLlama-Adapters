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
  methodology: `Counts the liquidity on all AMM pools.

  We get the TVL by first fetching all the PairCreated() events emitted by the factory contract in order to get all the pairs and then we get the amount of tokens on each pair by calling getReserves() on that pair's contract. Once we have the total amount locked of each token we just price them using coingecko, and, if coingecko doesn't have the price of one of the tokens we just exclude that token from the TVL.
  
  MALT (v1) has been manually excluded from the TVL since the price on coingecko became outdated and it led to incorrect results, however this shouldn't affect the total TVL since all MALT liquidity is gone due to the depegging, so the amount we are removing from the TVL should be close to zero.`,
  tvl,
};
