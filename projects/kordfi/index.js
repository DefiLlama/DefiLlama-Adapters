const { sumTokens, getStorage } = require("../helper/chain/tezos")
const SIRS = 'KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5'

async function tvl(api) {
  const { lqtAddress, tokenAddress, xtzPool, lqtTotal, tokenPool } = await getStorage(SIRS)
  await sumTokens({
    includeTezos: true, balances: api.getBalances(), owners: [
      'KT1WL6sHt8syFT2ts7NCmb5gPcS2tyfRxSyi',
      'KT19qWdPBRtkWrsQnDvVfsqJgJB19keBhhMX'
    ]
  })

  const LPtoken = 'tezos:' + lqtAddress
  const lqtBal = api.getBalances()[LPtoken] ?? 0
  const ratio = lqtBal / lqtTotal
  api.add(tokenAddress, tokenPool * ratio)
  api.add("coingecko:tezos", xtzPool * ratio / 1e6, { skipChain: true })

  api.removeTokenBalance(LPtoken)
  api.removeTokenBalance('KT18j785rB3G4wXxEpqwwG2hJ2iZrjLAbeo7')

  return api.getBalances()
}
module.exports = {
  tezos: { tvl },
}
