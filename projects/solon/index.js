const { sumTokens2 } = require('../helper/unwrapLPs')

const USDG = '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168'
const WETH = '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73'
const NFPM = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3'
const vaults = [
  '0x9Db7aDa64D1E8b856E15D916d886797501F28ce0', // UniV3DualVault
  '0x9e100d524DFEa1Aa76286A7F00682e72F79aC3aE', // UniV3LeverageVault
  '0xfd7Ab6A724f28cE958Ee29E7A9DfAE7b9efC6B91', // SolonRangeVault
]

async function tvl(api) {
  return sumTokens2({
    api,
    // Only unborrowed underlying reserves, never eToken supply or debt.
    tokensAndOwners: [
      [USDG, '0x59286206faCD48E002a4e0EaC106998567071Ef3'],
      [WETH, '0x2e3409b1d8068eB330437d89048b3d96D6379dac'],
    ],
    tokens: [USDG, WETH],
    owners: vaults,
    resolveUniV3: true,
    uniV3WhitelistedTokens: [USDG, WETH],
    uniV3ExtraConfig: { nftAddress: NFPM },
  })
}

module.exports = {
  methodology: 'Counts leverage lending-pool underlying reserves, idle USDG/WETH and the underlying principal of Uniswap V3 LP positions held by Solon vaults on Robinhood Chain; the Morpho-curated solUSDG lending vault is tracked separately via the curators registry and is not counted again.',
  robinhood: { tvl },
}
