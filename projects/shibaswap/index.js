const {calculateUniTvl} = require('../helper/calculateUniTvl.js')

const FACTORY = '0x115934131916c8b277dd010ee02de363c09d037c';

async function tvl(_, ethBlock, chainBlocks) {
  const chain = 'ethereum'
  const balances = await calculateUniTvl(id=>id, ethBlock, chain, FACTORY, 0, true)
  return balances
};

module.exports = {
  tvl
};