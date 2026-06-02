const { queryV1Beta1V2 } = require('../helper/chain/cosmos');

const NOBLE_SUPPLY_URL = 'bank/v1beta1/supply';
const IGNORE_DENOMS = ['ufrienzies', 'ustake'];

async function tvl(api) {
  const supply = await queryV1Beta1V2({ api, url: NOBLE_SUPPLY_URL })
  supply.forEach(({ denom, amount }) => {
    if (IGNORE_DENOMS.includes(denom)) return
    api.add(denom, amount)
  })
}

module.exports = {
  noble: {
    tvl,
  },
};
