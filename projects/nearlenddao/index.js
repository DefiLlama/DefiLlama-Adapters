const { call, sumSingleBalance, sumTokens } = require('../helper/chain/near')
const NEARLEND_DAO_CONTRACT = 'v1.nearlend-official.near'

async function borrowed() {
  const balances = {};
  const assetsCallResponse = await call(NEARLEND_DAO_CONTRACT, 'get_assets_paged', {});

  assetsCallResponse.forEach(([token, asset]) => {
    const extraDecimals = asset.config.extra_decimals;
    sumSingleBalance(balances, token, asset.borrowed.balance / (10 ** extraDecimals));
  })

  return balances;
}

async function tvl(api) {
  const assetsCallResponse = await call(NEARLEND_DAO_CONTRACT, 'get_assets_paged', {});
  const tokens = assetsCallResponse.map(([token]) => token);
  return sumTokens({ owners: [NEARLEND_DAO_CONTRACT], tokens });
}

module.exports = {
  near: {
    tvl,
    borrowed,
  },
  timetravel: false,
  methodology: 'Summed up all the tokens deposited in their main lending contract'
}
