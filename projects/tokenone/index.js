// TokenOne pools: ERC-4626 vaults (RwaVaultV3) funding Brazilian private credit (trade receivables, debentures).
// totalAssets = asset idle in the vault + deployedCapital, which TokenOne's oracle role reports on-chain daily
// (the contract rejects reports older than 24h or moving more than 10%). Pool metadata is in each vault's contractURI().
// Vaults are deployed directly, not through a factory, so new pools have to be added here.
const config = {
  rls: [
    '0x8ffF24202C1360324571DF9cA8AFf5137A963492', // TKONE01, issuer TokenOne Securitizadora
    '0x2BDbD4001EAF67077105b388a5Cf2df26c65f1b7', // AMC01, issuer AMC Capital
  ],
  base: [
    '0x8Db493c05f9094d0bc9778A50c3fCC62E7A10CAb', // VFPV01, Vestfalen Private Fund
  ],
}

// BRLT is TokenOne's own BRL token (6 decimals, same address on every chain) and has no price feed,
// so vault NAV denominated in BRLT is valued as BRL
const BRLT = '0xe14c117Ea3Eba1728cc8003590c04eb641F1e268'

async function tvl(api) {
  const vaults = config[api.chain]
  const assets = await api.multiCall({ abi: 'address:asset', calls: vaults })
  const totalAssets = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults })
  assets.forEach((asset, i) => {
    if (asset.toLowerCase() === BRLT.toLowerCase()) api.addCGToken('brl1', totalAssets[i] / 1e6)
    else api.add(asset, totalAssets[i])
  })
}

module.exports = {
  methodology: 'TVL is the totalAssets of each TokenOne vault: assets held by the vault plus capital deployed into Brazilian private credit, as reported on-chain daily by TokenOne. Vaults denominated in BRLT, TokenOne\'s BRL token, are valued in BRL.',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
