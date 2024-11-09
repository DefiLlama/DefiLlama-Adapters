const { sumTokens } = require('../helper/chain/waves')


module.exports = {
  waves: { tvl }
}

async function tvl(api) {
  return sumTokens({ owners: ['3PC9BfRwJWWiw9AREE2B3eWzCks3CYtg4yo',], includeWaves: true, api, blacklistedTokens: ['DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p', '6nSpVyNH7yM69eg446wrQR94ipbbcmZMU1ENPwanC97g'] })
}