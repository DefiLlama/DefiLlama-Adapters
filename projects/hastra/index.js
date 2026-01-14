const { getTokenAccountBalances, getTokenSupplies } = require('../helper/solana')
const { sumTokens2 } = require('../helper/unwrapLPs');

// const PRIMEAccount = '3b8X44fLF9ooXaUm3hhSgjpmVs6rZZ3pPoGnGahc3Uu7'
const wYLDSVaultAccount = "FvkbfMm98jefJWrqkvXvsSZ9RFaRBae8k6c1jaYA5vY3"
const RedeemVaultAccount = "HH1hSzaBKvBDf7GWD1mw557Q8LwBPHHE63WEu6BURS8X"

async function solanaTvl(api) {
    const wYLDSVaultBalance = await getTokenAccountBalances([wYLDSVaultAccount])
    Object.keys(wYLDSVaultBalance).map(token => api.add(token, wYLDSVaultBalance[token]))
    const redeemVaultBalance = await getTokenAccountBalances([RedeemVaultAccount])
    Object.keys(redeemVaultBalance).map(token => api.add(token, redeemVaultBalance[token]))
    return api.getBalances()
}

module.exports = {
  doublecounted: true,
  timetravel: true,
  methodology: 'Hastra TVL consists of the amount of vaulted wYLDS, plus the amount of unredeemed tokens in the redemption vault.',
  solana: { tvl: solanaTvl },
};
