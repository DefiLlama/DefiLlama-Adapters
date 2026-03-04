const { getDynamicFieldObjects, getObjects } = require('../helper/chain/sui');

const marketsTableId = '0x2326d387ba8bb7d24aa4cfa31f9a1e58bf9234b097574afb06c5dfb267df4c2e';
const marketType = '0xd631cd66138909636fc3f73ed75820d0c5b76332d1644608ed1c85ea2b8219b4::market::Market';

function normalizeSuiType(typeName = '') {
  return typeName.startsWith('0x') ? typeName : `0x${typeName}`;
}

async function fetchMarkets() {
  return getDynamicFieldObjects({
    parent: marketsTableId,
    idFilter: (i) => i.objectType === marketType,
  });
}
async function tvl(api) {
  const marketsList = await fetchMarkets();
  
  for (const market of marketsList) {
    if (market.fields) {
        const coinType = normalizeSuiType(market.fields.value.fields.coin_type.fields.name);
        const amount = BigInt(market.fields.value.fields.balance_holding ?? '0');
        api.add(coinType, amount);
    }
  }
}
async function borrowed(api) {
  const marketsList = await fetchMarkets();
  for (const market of marketsList) {
    if (market.fields){
      const coinType = normalizeSuiType(market.fields.value.fields.coin_type.fields.name);
      const borrowedAmount = BigInt(market.fields.value.fields.borrowed_amount ?? '0');
      api.add(coinType, borrowedAmount);
    }
  }
}

module.exports = {
  sui: {
    tvl: tvl,
    borrowed: borrowed,
  },
};