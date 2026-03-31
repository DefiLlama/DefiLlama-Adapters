// Europa Tech — EU-regulated fractional real estate platform
// CONSOB registered (Italy), MiCA compliant, Base L2 (chainId: 8453)
// Website: https://europa-tech.org
// Legal: EUROPA TECH ENTERPRISE S.R.L. (P.IVA: 03084050347)

const CONTRACTS = {
  // EURT ERC-20 stablecoin (1 EURT = 1 EUR, EUR-pegged)
  EURT_TOKEN: '0xF0ff21C0a3De78a4503A77340079f3d4dad3d373',
  // ERC-4626 Yield Vault — users deposit EURT to earn real estate rental yield
  YIELD_VAULT: '0x63468cBe53E31c469412B8E2769284e87259e82b',
  // P2P Escrow — holds EURT during fractional share trades between investors
  P2P_ESCROW: '0xb629238600BE56Dc9d05f224DA4AEe1Dd44d0A7d',
}

module.exports = {
  base: {
    tvl: async (api) => {
      await api.sumTokens({
        owners: [CONTRACTS.YIELD_VAULT, CONTRACTS.P2P_ESCROW],
        tokens: [CONTRACTS.EURT_TOKEN],
      })
    },
  },
  methodology:
    'TVL = EURT (EUR-pegged stablecoin) held in EuropaYieldVault (ERC-4626) + ' +
    'EURT held in EuropaP2PEscrow. EURT is minted 1:1 when investors purchase ' +
    'fractional shares of tokenized Italian real estate (Hotel Baistrocchi, Salsomaggiore Terme).',
}
