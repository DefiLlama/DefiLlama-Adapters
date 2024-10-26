const { getExports } = require('../helper/heroku-api')
const { sumTokens2 } = require('../helper/solana')

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
}
const { solana: { tvl } } = getExports("raydium", ['solana'])

module.exports.solana = {
  staking: () => sumTokens2({ tokenAccounts: ['8tnpAECxAT9nHBqR1Ba494Ar5dQMPGhL31MmPJz1zZvY'] }),
  tvl: tvlWithCheck,
}

async function tvlWithCheck(api) {
  const balances = await tvl(api)
  api.addBalances(balances)
  api.removeTokenBalance('DS4QiZfkp39PsHXYCRV3NkyDUKV9SpTczp2qnAUg6Nt6') // ZMB
  // api.removeTokenBalance('HDa3zJc12ahykSsBRvgiWzr6WLEByf36yzKKbVvy4gnF') // SOS
  const usdValue = await api.getUSDValue()
  // for some godforsaken reason, the TVL is sometimes reported as 60M, we fail in that case rather than report a wrong number
  if (usdValue < 2e8) throw new Error('TVL is too low :' + usdValue / 1e6 + 'M')
  return api.getBalances()
}