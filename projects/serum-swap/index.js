const { getPools } = require('./pools')
const { sumTokens2, } = require('../helper/solana')

async function tvl() {
  const pools = getPools()
  const tokenAccounts = pools.map(p => p.holdingAccounts).flat().filter(i => i !== '11111111111111111111111111111111')
  return sumTokens2({ tokenAccounts })
}

module.exports = {
  timetravel: false,
  solana: { tvl }
}
