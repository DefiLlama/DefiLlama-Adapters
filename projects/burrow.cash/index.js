const { call, sumSingleBalance } = require('../helper/chain/near')
const { default: BigNumber } = require("bignumber.js")
const BURROW_CONTRACT = 'contract.main.burrow.near'

function tvl(borrowed = false) {
  return async () => {
    const balances = {};
    const assetsCallResponse = await call(BURROW_CONTRACT, 'get_assets_paged', {});

    assetsCallResponse.forEach(([token, asset]) => {
      const extraDecimals = asset.config.extra_decimals;
      const amount = borrowed ?
        BigNumber(asset.borrowed.balance) :
        BigNumber(asset.supplied.balance).plus(BigNumber(asset.reserved)).minus(BigNumber(asset.borrowed.balance));
      const adjustedAmount = amount.shiftedBy(-1 * extraDecimals);
      sumSingleBalance(balances, token, adjustedAmount);
    });

    return balances;
  }
}

module.exports = {
  near: {
    tvl: tvl(),
    borrowed: tvl(true)
  },
  misrepresentedTokens: true,
  timetravel: false,
  methodology: 'Summed up all the tokens deposited in their main lending contract'
}
