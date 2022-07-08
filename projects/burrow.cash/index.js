const { call, sumSingleBalance } = require('../helper/near')
const BURROW_CONTRACT = 'contract.main.burrow.near'

function tvl(borrowed = false) {
  return async () => {
    const balances = {};
    const assetsCallResponse = await call(BURROW_CONTRACT, 'get_assets_paged', {});

    const assets = assetsCallResponse.map(([asset]) => asset);
    const amount = borrowed ? assetsCallResponse.map(a => a[1].borrowed.balance) 
      : assetsCallResponse.map(a => a[1].supplied.balance - a[1].borrowed.balance);

    for (let asset of assets) {
      sumSingleBalance(balances, asset, amount[assets.indexOf(asset)]);
    };

    return balances;
  }
};

module.exports = {
  near: {
    tvl: tvl(),
    borrowed: tvl(true)
  },
  misrepresentedTokens: true,
  timetravel: false,
  methodology: 'Summed up all the tokens deposited in their main lending contract'
}
