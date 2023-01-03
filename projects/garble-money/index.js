const sdk = require('@defillama/sdk')
const { sumTokensExport, nullAddress, } = require('../helper/sumTokens')

async function tvl() {

  const balances = {}

  sdk.util.sumSingleBalance(balances, 'tether', await getTokenBalance('', ''))
  sdk.util.sumSingleBalance(balances, 'tron', await getTrxBalance('') / (10 ** 6))
  sdk.util.sumSingleBalance(balances, 'usdd', await getTokenBalance('', ''))
  sdk.util.sumSingleBalance(balances, 'justmoney-2', await getTokenBalance('', ''))

  return balances
}

module.exports = {
  tron: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [nullAddress, 'TCdY8kA7XsZ5UUw8jEgbVRbS2MVttrY9AC'],
        ['TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', 'TYaaJsD44isGwQUbvHNuii8nAnTKSxPcND'],
        ['TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn', 'TWupFtHWnURhDNrWBfB2tK3zD4uALurBgk'],
        ['TVHH59uHVpHzLDMFFpUgCx2dNAQqCzPhcR', 'TK76Z1mJQHN98WsuUUKeDZnNhwRsj6p5wo'],
      ]
    }),
  },
};
