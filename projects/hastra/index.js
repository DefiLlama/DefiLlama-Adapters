const { sumTokens2 } = require('../helper/solana')

const HASTRA_SOLANA_USDC_VAULT_ID = "7oexQqeYUcMRQHK3jNS8qaJG6cpVomyCJDa6Px8SnqjA";

async function solanaTvl() {
    sumTokens2({ tokenAccounts: [HASTRA_SOLANA_USDC_VAULT_ID]})
}

module.exports = {
  doublecounted: false,
  timetravel: false,
  methodology: 'TVL consists of USDC contained in the Hastra Solana vault, plus YLDS held in the Hastra Provenance Wallet',
  solana: { tvl: solanaTvl },
};
