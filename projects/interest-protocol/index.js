const { dexExport } = require('../helper/chain/sui');

const getTokens = (pool) => {
  const type = pool.type.split('Pool');
  const poolArgs = type[1];
  const tokens = poolArgs.split(',');
  return [tokens[1].trim(), tokens[2].split('>')[0].trim()];
};

module.exports = dexExport({
  account: '0x108779144605a44e4b5447118b711f0b17adf6168cc9b08551d33daca58098e3',
  poolStr: 'core::Pool',
  token0Reserve: i => i.fields.balance_x,
  token1Reserve: i => i.fields.balance_y,
  getTokens
});