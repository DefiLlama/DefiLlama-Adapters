const { sumTokens2 } = require('../helper/solana')

async function tvl(api) {
  return sumTokens2({
    api,
    tokenAccounts: [
      // LP Vault — liquidity pool deposits
      'H1YCpzUXcoYFnek3Qc8VtekAe4gDTDNZZDVLwYuC9J1C',
      // Fee Vault — user margin deposits + collected trading fees
      'BFm4z6Z2H84GrpcKkydmE1qZVidwuj2sP3N3wTNZemJt',
      // Insurance Fund
      '266CZZpRb1PFDGQf4bNE5ASPVxAUkon6tv6BvRYpP7x9',
    ],
  })
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the sum of USDC deposited in the liquidity pool, fee vault (which holds user margin collateral), and insurance fund.',
  solana: {
    tvl,
  },
}
