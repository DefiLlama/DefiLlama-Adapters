
const { sumTokens2, } = require('../helper/chain/tezos')
const { get, } = require('../helper/http')

async function tvl() {
  const tokenToTokenLPAddress = 'KT1VNEzpf631BLsdPJjt2ZhgUitR392x6cSi'
  return sumTokens2({ owners: [tokenToTokenLPAddress, ... await getLPs('Quipuswap')], includeTezos: true, })
}

async function getLPs(dex) {
  const { contracts } = await get('https://api.teztools.io/token/prices')
  const LPs = {}
  for (const { pairs } of contracts)
    pairs.filter(p => p.dex === dex).forEach(p => LPs[p.address] = p)
  return Object.keys(LPs)
}

module.exports = {
  timetravel: false,
  tezos: {
    tvl,
  }
}
