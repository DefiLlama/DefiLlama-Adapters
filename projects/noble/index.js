const { queryV1Beta1 } = require('../helper/chain/cosmos');

const NOBLE_SUPPLY_URL = 'bank/v1beta1/supply';
const IGNORE_DENOMS = ['ufrienzies', 'ustake'];

async function tvl(api) {
  let key
  do {
    const { supply, pagination } = await queryV1Beta1({ api, url: `${NOBLE_SUPPLY_URL}?pagination.key=${key || ''}` })
    key = pagination.next_key
    supply.forEach(i => api.add(i.denom, i.amount))
  } while (key);
  IGNORE_DENOMS.forEach(denom => api.removeTokenBalance(denom))
}

module.exports = {
  noble: {
    tvl,
  },
};
