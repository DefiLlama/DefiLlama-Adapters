const { call, sumSingleBalance, sumTokens, } = require('./helper/chain/near')

const PROJECT_LST_CONTRACT = "lst.rhealab.near";

async function tvl() {
  const balances = {}
  const lstSummary = await call(PROJECT_LST_CONTRACT, 'get_summary', {});
  sumSingleBalance(balances, 'wrap.near', lstSummary.total_staked_near_amount);
  return balances
}

async function staking() {
  return sumTokens({ owners: ['xtoken.rhealab.near'], tokens: ['token.rhealab.near'], })
}


module.exports = {
  near: {
    tvl, staking,
  },
  hallmarks: [
    [1666648800,"DCB withdrawn liquidity"]
  ],
};
