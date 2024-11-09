const { queryV1Beta1 } = require('../helper/chain/cosmos');
const { sumTokens2 } = require('../helper/unwrapLPs');

const NOBLE_DENOMS_URL = 'bank/v1beta1/denoms_metadata';
const NOBLE_SUPPLY_URL = 'bank/v1beta1/supply/';

const IGNORE_DENOMS = ['ufrienzies', 'ustake'];

async function tvl(api) {
  const { metadatas } = await queryV1Beta1({ api, url: NOBLE_DENOMS_URL });

  for (const metadata of metadatas) {
    const baseDenom = metadata.base;

    // ignore invalid denoms
    if (IGNORE_DENOMS.includes(baseDenom))
      continue;

    // fetch supply for denom
    const { amount } = await queryV1Beta1({ api, url: `${NOBLE_SUPPLY_URL}${baseDenom}` });
    api.add(baseDenom, amount.amount);
  }
  return sumTokens2({ api });
}

module.exports = {
  noble: {
    tvl,
  },
};
