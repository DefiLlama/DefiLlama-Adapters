const { sumTokens2 } = require('../helper/solana')

const SATS_VAULT_BTC_ATA = "2zpcctvd7sCdtWe4bAYcNmfVFzaiFVtH81tfMAWCtMh9";

async function tvl(api) {
  const tokenAccounts = [SATS_VAULT_BTC_ATA];
  return sumTokens2({ tokenAccounts, api });
}

module.exports = {
  timetravel: false,
  methodology: 'BTC (cbBTC) received from mining held in the Sats Vault.',
  solana: {
    tvl
  },
  start: "2026-08-02",
}
