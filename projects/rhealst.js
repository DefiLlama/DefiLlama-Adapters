const { call, sumSingleBalance, } = require('./helper/chain/near')

const PROJECT_LST_CONTRACT = "lst.rhealab.near";

async function tvl() {
  const balances = {}
  const lstSummary = await call(PROJECT_LST_CONTRACT, 'get_summary', {});
  sumSingleBalance(balances, 'wrap.near', lstSummary.total_staked_near_amount);
  return balances
}


module.exports = {
  near: {
    tvl,
  },
  hallmarks: [
    [1666648800,"DCB withdrawn liquidity"]
  ],
};
