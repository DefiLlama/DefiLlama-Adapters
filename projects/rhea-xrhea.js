const { call, sumSingleBalance, } = require('./helper/chain/near')

const PROJECT_LST_CONTRACT = "xtoken.rhealab.near";

async function tvl() {
  const balances = {}
  const xrheaAmount = await call(PROJECT_LST_CONTRACT, 'ft_total_supply', {});
  sumSingleBalance(balances, PROJECT_LST_CONTRACT, xrheaAmount);
  return balances;
}


module.exports = {
  near: {
    tvl,
  },
};
