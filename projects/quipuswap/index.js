
const { getLPs, sumTokens, convertBalances, } = require('../helper/tezos')
const { getFixBalances } = require('../helper/portedTokens')

async function tvl() {
  const tokenToTokenLPAddress = 'KT1VNEzpf631BLsdPJjt2ZhgUitR392x6cSi'
  let balances = await sumTokens({ owners: [tokenToTokenLPAddress, ... await getLPs('Quipuswap')], includeTezos: true, })
  const fixBalances = await getFixBalances('tezos')
  balances = await convertBalances(balances)
  fixBalances(balances)
  return balances
}

module.exports = {
  timetravel: false,
  tezos: {
    tvl,
  }
}
