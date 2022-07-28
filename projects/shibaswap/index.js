const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const {getUniTVL} = require('../helper/unknownTokens')

const FACTORY = '0x115934131916c8b277dd010ee02de363c09d037c';

async function tvl(_, ethBlock, chainBlocks) {
  const chain = 'ethereum'
  const balances = await calculateUniTvl(id=>id, ethBlock, chain, FACTORY, 0, true)
  return balances
};

module.exports = {
  ethereum: {
    tvl: getUniTVL({
      factory: FACTORY,
      chain: 'ethereum',
      coreAssets: [
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', //weth
        '0x514910771af9ca656af840dff83e8264ecf986ca', //link
        '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', //uni
        '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', //aave
        '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', //wbtc
        '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f', //snx
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', //usdc
        '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', //yfi
      ]
    })
  }
}; 