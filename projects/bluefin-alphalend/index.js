const { getDynamicFieldObjects, getObjects } = require('../helper/chain/sui');

const MARKETS_CONTAINER = '0x2326d387ba8bb7d24aa4cfa31f9a1e58bf9234b097574afb06c5dfb267df4c2e';

async function tvl(api) {
  const marketData = await getDynamicFieldObjects({
    parent: MARKETS_CONTAINER,
    idFilter: (i) => i.objectType.includes('::market::Market'),
  });

  for (const market of marketData) {
    const { fields } = market;
    if (!fields) continue;

    const coinType = "0x" + fields.value.fields.coin_type.fields.name;
    const balance = Number(fields.value.fields.balance_holding);
    api.add(coinType, balance);
  }
}
async function borrowed(api) {
  const marketData = await getDynamicFieldObjects({
    parent: MARKETS_CONTAINER,
    idFilter: (i) => i.objectType.includes('::market::Market'),
  });

  for (const market of marketData) {
    const { fields } = market;
    if (!fields) continue;

    const coinType = "0x" + fields.value.fields.coin_type.fields.name;
    const borrowed = Number(fields.value.fields.borrowed_amount);

    api.add(coinType, borrowed);
  }
}

module.exports = {
  sui: {
    tvl: tvl,
    borrowed: borrowed,
  },
  hallmarks: [
    ['2025-05-07', 'AlphaLend Launched'],
  ],
};
