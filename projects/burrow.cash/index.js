const { call, addTokenBalances, sumSingleBalance} = require('../helper/near')

const BURROW_CONTRACT = 'contract.main.burrow.near'

async function tvl() {
  const balances = {}

  const assetsCallResponse = await call(BURROW_CONTRACT, 'get_assets_paged', {})
  const assets = assetsCallResponse
      .map(([asset]) => asset)
      .filter(asset => !/\.burrow\./.test(asset))  // Ignore all assets that can be considered native tokens
  await addTokenBalances(assets, BURROW_CONTRACT, balances)
  return balances
}

async function borrowed() {
  const balances = {}
  const assetsCallResponse = await call(BURROW_CONTRACT, 'get_assets_paged', {})
  assetsCallResponse
      .map((asset_info) => {
        const token_id = asset_info[0];
        const asset = asset_info[1];
        if(!/\.burrow\./.test(token_id)) { // Ignore all assets that can be considered native tokens
          sumSingleBalance(balances, token_id, asset.borrowed.balance)
        }
      });
  return balances
}

module.exports = {
  near: {
    tvl,
    borrowed
  },
  misrepresentedTokens: true,
  methodology: 'Summed up all the tokens deposited in their main lending contract'
};
