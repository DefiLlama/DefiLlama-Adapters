const { getConfig } = require('./helper/cache')
const { sumTokens2 } = require('./helper/solana')

async function tvl() {
  const { data } = await getConfig('crema-solana', "https://api.crema.finance/v1/swap/count")
  const tokenAccounts = data.pools.map(i => ([i.token_a_reserves, i.token_b_reserves])).flat()
  return sumTokens2({ tokenAccounts })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  },
};
