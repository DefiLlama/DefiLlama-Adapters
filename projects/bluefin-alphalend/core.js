const { getDynamicFieldObjects } = require('../helper/chain/sui');

const MARKETS_CONTAINER = '0x2326d387ba8bb7d24aa4cfa31f9a1e58bf9234b097574afb06c5dfb267df4c2e';
const SWITCH_TS = 1778976000;

async function fetchMarkets() {
  return getDynamicFieldObjects({
    parent: MARKETS_CONTAINER,
    idFilter: (i) => i.objectType.includes('::market::Market'),
  });
}

async function tvl(api) {
  const marketData = await fetchMarkets();
  for (const market of marketData) {
    const { fields } = market;
    if (!fields) continue;
    const coinType = "0x" + fields.value.fields.coin_type.fields.name;
    api.add(coinType, Number(fields.value.fields.balance_holding));
  }
}

async function borrowed(api) {
  const marketData = await fetchMarkets();
  for (const market of marketData) {
    const { fields } = market;
    if (!fields) continue;
    const coinType = "0x" + fields.value.fields.coin_type.fields.name;
    api.add(coinType, Number(fields.value.fields.borrowed_amount));
  }
}

module.exports = { tvl, borrowed, SWITCH_TS};