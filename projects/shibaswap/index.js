const {calculateUniTvl} = require('../helper/calculateUniTvl.js')

const FACTORY = '0x115934131916c8b277dd010ee02de363c09d037c';

async function tvl(_, ethBlock, chainBlocks) {
  const chain = 'ethereum'
  const balances = await calculateUniTvl(id=>id, ethBlock, chain, FACTORY, 0, true)
  delete balances['0x3f7aff0ef20aa2e646290dfa4e67611b2220c597']
  return balances
};

module.exports = {
  ethereum: {
    tvl
  }
}; 