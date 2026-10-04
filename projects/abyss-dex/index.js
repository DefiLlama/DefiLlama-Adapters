const { uniV3Export } = require('../helper/uniswapV3');

module.exports = {
  methodology: 'TVL is the sum of both underlying ERC20 balances held by Abyss pools on Robinhood. Pools are discovered from factory PoolCreated events. Separate treasury and fee-vault holdings are excluded.',
  ...uniV3Export({
    robinhood: {
      factory: '0xe7feF2BC860B25bbdEB6F6AB96d88bAAa77ddad7',
      fromBlock: 50161538,
    },
  }),
};
