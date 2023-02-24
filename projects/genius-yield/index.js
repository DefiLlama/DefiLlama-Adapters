const { getTokenBalance, getTokenPrice } = require('../helper/chain/cardano')

const asset = 'dda5fdb1002f7389b33e036b6afee82a8189becb6cba852e8b79b4fb'
const asset1 = 'dda5fdb1002f7389b33e036b6afee82a8189becb6cba852e8b79b4fb0014df1047454e53'
const owner = 'addr1w8r99sv75y9tqfdzkzyqdqhedgnef47w4x7y0qnyts8pznq87e4wh'

async function staking() {
  const [ bal, price] = await Promise.all([
    getTokenBalance(asset1, owner),
    getTokenPrice(asset)
  ])

  return {
    cardano: bal * price / 1e6
  };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  cardano: {
    staking,
    tvl: () => ({})
  }
};