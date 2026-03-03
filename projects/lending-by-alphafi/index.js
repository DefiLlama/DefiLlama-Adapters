const { getDynamicFieldObjects, getObjects } = require('../helper/chain/sui');

const marketsTableId = '0x2326d387ba8bb7d24aa4cfa31f9a1e58bf9234b097574afb06c5dfb267df4c2e';

async function tvl(api) {
  const marketsList = await getDynamicFieldObjects({
    parent: marketsTableId,
    idFilter: (i) => i.objectType == '0xd631cd66138909636fc3f73ed75820d0c5b76332d1644608ed1c85ea2b8219b4::market::Market',
  });
  
  for (const market of marketsList) {
    if (market.fields){
      const coinType = "0x" + market.fields.value.fields.coin_type.fields.name;
      const amount = Number(market.fields.value.fields.balance_holding);
      api.add(coinType, amount);
    }
  }
}
async function borrowed(api) {
  const marketsList = await getDynamicFieldObjects({
    parent: marketsTableId,
    idFilter: (i) => i.objectType == '0xd631cd66138909636fc3f73ed75820d0c5b76332d1644608ed1c85ea2b8219b4::market::Market',
  });
  for (const market of marketsList) {
    if (market.fields){
      const coinType = "0x" + market.fields.value.fields.coin_type.fields.name;
      const borrowedAmount = Number(market.fields.value.fields.borrowed_amount);

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