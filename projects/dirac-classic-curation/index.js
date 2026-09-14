const { getCuratorExport } = require('../helper/curators')

// Dirac Classic Curation — one of Dirac Finance's two curation modes.
//
// Curators deploy and manage Morpho Vault V2 vaults through Dirac's vault
// deployer. Each vault is created with the deployer as its initial owner (the
// deployer configures adapters/caps/roles in one tx, then hands ownership to the
// curator), so DefiLlama's curators registry attributes the vaults by that owner
// address (morphoVaultOwners) — no hardcoded vault list, new vaults are picked up
// automatically. The vault factories are Morpho's canonical VaultV2 factories,
// already tracked by the curators registry (Base, Robinhood).
//
// The other mode is delta-neutral DiracVault strategies -> `dirac-delta-neutral-curation`.

module.exports = getCuratorExport({
  methodology:
    "Counts assets deposited in the Morpho Vault V2 vaults curated by Dirac, discovered on-chain via the DefiLlama curators registry by their deployer/owner address (morphoVaultOwners). One of Dirac Finance's two curation modes; the other is delta-neutral DiracVault strategies (dirac-delta-neutral-curation).",
  blockchains: {
    base: {
      // Dirac vault deployers (current + legacy) = the initial owner emitted by
      // the Morpho VaultV2 factory's CreateVaultV2 event.
      morphoVaultOwners: [
        '0x317848EBa554a92d34a763C4175C38170753ea8A',
        '0x7d45718c79186Da8889111b5D8d7eDe6d128fb14',
      ],
    },
    robinhood: {
      // Dirac vault deployer on Robinhood (earn / Morpho-only chain, no
      // delta-neutral stack).
      morphoVaultOwners: [
        '0x56d119aa73062e69c688870e1d22f589f4fa69c1',
      ],
    },
  },
})
