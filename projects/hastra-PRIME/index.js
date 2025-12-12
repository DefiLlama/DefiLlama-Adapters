const { getTokenSupplies, getTokenAccountBalances } = require('../helper/solana')
const { sumTokens2 } = require('../helper/unwrapLPs');

const wYLDSVaultAccount = "FvkbfMm98jefJWrqkvXvsSZ9RFaRBae8k6c1jaYA5vY3"

async function solanaTvl(api) {
    const wYLDSVaultBalance = await getTokenAccountBalances([wYLDSVaultAccount])
    Object.keys(wYLDSVaultBalance).map(token => api.add(token, wYLDSVaultBalance[token]))
    return api.getBalances()
}

async function provenanceTvl(api) {
  const wYLDSVaultBalance = await getTokenAccountBalances([wYLDSVaultAccount])
  Object.keys(wYLDSVaultBalance).map(token => api.add('uylds.fcc', wYLDSVaultBalance[token]))
  return sumTokens2({ api })
}

module.exports = {
  doublecounted: true,
  timetravel: true,
  methodology: 'Solana TVL consists of the amount of vaulted wYLDS. Provenance TVL is a 1:1 with vaulted wYLDS.',
  solana: { tvl: solanaTvl },
  provenance: { tvl: provenanceTvl },
};
