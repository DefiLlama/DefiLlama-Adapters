const { getTokenAccountBalances, sumTokens2 } = require('../helper/solana')
const { staking } = require('../helper/staking')
const ADDRESSES = require('../helper/coreAssets.json')

const solanaRedeemVaultAccount = "HH1hSzaBKvBDf7GWD1mw557Q8LwBPHHE63WEu6BURS8X"
const ethereumWYLDSContract = "0x6aD038cA6C04e885630851278ca0a856Ad9a66Cc"
const ethereumRedeemVaultAccount = "0xA8C3CF6183D49d5D372f8FC149BD2cb5CFC0faCd"

// Staking Accounts
// Solana
const solanaPrimeWYLDSVaultAccount = "FvkbfMm98jefJWrqkvXvsSZ9RFaRBae8k6c1jaYA5vY3"
const solanaAutoWYLDSVaultAccount = "GtWPVP3KPTJC8z9wPLAop4mPp9jZiRKzL8deDD4PfQ7C"
// Ethereum
const ethereumPrimeStakingContract = "0x19ebb35279A16207Ec4ba82799CC64715065F7F6"
const ethereumAutoStakingContract = "0x997E2Efbce91D170B00EA402e35a66C887EE1da9"
const ethereumSmbStakingContract = "0xBd49537Cc9105E8c1651Ed12b94cD9A3D79Bf3d9"

/**
 * Counts wYLDS in the Solana PRIME and AUTO vaults, plus unredeemed tokens in the Solana redemption vault.
 * @param {object} api DefiLlama chain API used to record token balances
 * @returns {Promise<object>} Token balances counted toward Solana TVL
 */
async function solanaTvl(api) {
  const balances = await getTokenAccountBalances([
    solanaPrimeWYLDSVaultAccount,
    solanaAutoWYLDSVaultAccount,
    solanaRedeemVaultAccount
  ])
  Object.entries(balances).forEach(([token, balance]) => {
      api.add(token, balance);
  });

  return api.getBalances();
}

/**
 * Counts wYLDS in the Ethereum PRIME, AUTO, and SMB staking vaults, plus USDC in the Ethereum redemption vault.
 * @param {object} api DefiLlama chain API used to record token balances
 * @returns {Promise<object>} Token balances counted toward Ethereum TVL
 */
async function ethereumTvl(api) {
  return api.sumTokens({ tokensAndOwners: [
    [ethereumWYLDSContract, ethereumPrimeStakingContract],
    [ethereumWYLDSContract, ethereumAutoStakingContract],
    [ethereumWYLDSContract, ethereumSmbStakingContract],
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
