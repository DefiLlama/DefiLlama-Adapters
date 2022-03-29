const { call, addTokenBalances, } = require('../helper/near')

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


module.exports = {
  near: {
    tvl,
  },
  misrepresentedTokens: true,
  methodology: 'Summed up all the tokens deposited in their main lending contract'
};
