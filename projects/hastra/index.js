const { getTokenAccountBalances } = require('../helper/solana')

const wYLDSVaultAccount = "FvkbfMm98jefJWrqkvXvsSZ9RFaRBae8k6c1jaYA5vY3"
const RedeemVaultAccount = "HH1hSzaBKvBDf7GWD1mw557Q8LwBPHHE63WEu6BURS8X"

async function solanaTvl(api) {
  const balances = await getTokenAccountBalances([wYLDSVaultAccount, RedeemVaultAccount])
  Object.entries(balances).forEach(([token, balance]) => {
      api.add(token, balance);
  });

  return api.getBalances();
}

module.exports = {
  doublecounted: true,
  methodology: 'Hastra TVL consists of the amount of vaulted wYLDS, plus the amount of unredeemed tokens in the redemption vault.',
  solana: { 
    tvl: solanaTvl,
  },
};
