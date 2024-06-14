const { call, sumSingleBalance, } = require('./helper/chain/near')


const PROJECT_CONTRACT = 'v1.lpos-market.near'


async function tvl() {
  const balances = {}
  const validators = await call(PROJECT_CONTRACT, 'get_validators', {})
  validators.forEach((validator) => {
	sumSingleBalance(balances, "wrap.near", validator.total_staked_balance)
  })
  
  return balances
}


module.exports = {
  near: {
    tvl,
  },
};
