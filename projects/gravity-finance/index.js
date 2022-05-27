const {calculateUniTvl} = require('../helper/calculateUniTvl.js');
const {transformPolygonAddress} = require('../helper/portedTokens');

async function tvl(_, block, chainBlocks) {
  const transformPolygon = await transformPolygonAddress();
  block = chainBlocks['polygon'];

  const balances = await calculateUniTvl(
    transformPolygon, 
    block, 
    'polygon', 
    '0x3ed75AfF4094d2Aaa38FaFCa64EF1C152ec1Cf20', 
    18134755, 
    true
  );
    
  return balances;
};

module.exports = {
  methodology: `Counts the liquidity on all AMM pools.
  We get the TVL by first fetching all the PairCreated() events emitted by the factory contract in order to get all the pairs and then we get the amount of tokens on each pair by calling getReserves() on that pair's contract. Once we have the total amount locked of each token we just price them using coingecko, and, if coingecko doesn't have the price of one of the tokens we just exclude that token from the TVL.`,
  polygon: {
    tvl
  }
};
// node test.js projects/gravity-finance/index.js
