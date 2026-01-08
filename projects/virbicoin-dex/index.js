const { getUniTVL } = require('../helper/unknownTokens');

// Contract addresses
const FACTORY = '0x663B1b42B79077AaC918515D3f57FED6820Dad63';

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL is calculated by summing the liquidity in all AMM pools (Uniswap V2 fork).',
  virbicoin: {
    tvl: getUniTVL({
      factory: FACTORY,
      useDefaultCoreAssets: true,
      fetchBalances: true,
    }),
  },
};
