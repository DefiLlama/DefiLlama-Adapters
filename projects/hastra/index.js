const { getTokenAccountBalances, sumTokens2 } = require('../helper/solana')
const { staking } = require('../helper/staking')
const ADDRESSES = require('../helper/coreAssets.json')

const solanaWYLDSVaultAccount = "FvkbfMm98jefJWrqkvXvsSZ9RFaRBae8k6c1jaYA5vY3"
const solanaRedeemVaultAccount = "HH1hSzaBKvBDf7GWD1mw557Q8LwBPHHE63WEu6BURS8X"
const ethereumWYLDSContract = "0x6aD038cA6C04e885630851278ca0a856Ad9a66Cc"
const ethereumStakingContract = "0x19ebb35279A16207Ec4ba82799CC64715065F7F6"
const ethereumRedeemVaultAccount = "0xA8C3CF6183D49d5D372f8FC149BD2cb5CFC0faCd"

async function solanaTvl(api) {
  const balances = await getTokenAccountBalances([solanaWYLDSVaultAccount, solanaRedeemVaultAccount])
  Object.entries(balances).forEach(([token, balance]) => {
      api.add(token, balance);
  });

  return api.getBalances();
}

async function ethereumTvl(api) {
  return api.sumTokens({ tokensAndOwners: [
    [ethereumWYLDSContract, ethereumStakingContract],
    [ADDRESSES.ethereum.USDC, ethereumRedeemVaultAccount]
  ]})
}


module.exports = {
  doublecounted: true,
  methodology: 'Hastra TVL consists of the amount of vaulted wYLDS, plus the amount of unredeemed tokens in the redemption vaults.',
  solana: { 
    tvl: solanaTvl,
  },
  ethereum: {
    tvl: ethereumTvl,
  }
};
