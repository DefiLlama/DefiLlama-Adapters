const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const {getUniTVL} = require('../helper/unknownTokens')

const FACTORY = '0x115934131916c8b277dd010ee02de363c09d037c';

async function tvl(_, ethBlock, chainBlocks) {
  const chain = 'ethereum'
  const balances = await calculateUniTvl(id=>id, ethBlock, chain, FACTORY, 0, true)
  return balances
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: getUniTVL({
      factory: FACTORY,
      chain: 'ethereum',
      useDefaultCoreAssets: true,
    })
  }
}; 