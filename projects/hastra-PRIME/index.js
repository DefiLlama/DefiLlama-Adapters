const { getTokenAccountBalances, getTokenSupplies } = require('../helper/solana')
const { sumTokens2 } = require('../helper/unwrapLPs');

const PRIMEAccount = '3b8X44fLF9ooXaUm3hhSgjpmVs6rZZ3pPoGnGahc3Uu7'
const wYLDSVaultAccount = "FvkbfMm98jefJWrqkvXvsSZ9RFaRBae8k6c1jaYA5vY3"

async function solanaTvl(api) {
    await getTokenSupplies([PRIMEAccount], { api })
    return api.getBalances()
}

async function provenanceTvl(api) {
  const wYLDSVaultBalance = await getTokenAccountBalances([wYLDSVaultAccount])
  // Provenance holds a 1:1 balance of YLDS to wYLDS in the Vault Account
  Object.keys(wYLDSVaultBalance).map(token => api.add('ylds', wYLDSVaultBalance[token] / 1e6))
  return sumTokens2({ api })
}

module.exports = {
  doublecounted: true,
  timetravel: true,
  methodology: 'Solana TVL consists of the amount of vaulted wYLDS. Provenance TVL is a 1:1 with vaulted wYLDS.',
  solana: { tvl: solanaTvl },
  provenance: { tvl: provenanceTvl },
};
