
const { getLPs, sumTokens2, } = require('../helper/chain/tezos')

async function tvl() {
  const tokenToTokenLPAddress = 'KT1VNEzpf631BLsdPJjt2ZhgUitR392x6cSi'
  return sumTokens2({ owners: [tokenToTokenLPAddress, ... await getLPs('Quipuswap')], includeTezos: true, })
}

module.exports = {
  timetravel: false,
  tezos: {
    tvl,
  }
}
