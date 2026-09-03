const { getCuratorExport } = require("../helper/curators")

// Longbow curates isolated Morpho markets on Robinhood Chain. Depositors hold one position per
// vault; the curator routes that supply across markets.
//
// Vault V2 vaults are discovered from the factory already registered for `robinhood` in
// helper/curators/configs.js, filtered by the address that created them. That covers the USDG Core,
// Frontier and ETH vaults plus the MonkeyHood partner vault, and picks up new ones without a config
// change. The pre-V2 MetaMorpho vault is listed explicitly because there is no V1 vault factory
// registered for this chain, so it cannot be found by owner.
//
// Only vault assets are counted. Collateral sitting in the underlying Morpho markets is already
// part of the morpho-blue adapter's TVL on this chain, and the borrow side is Morpho's book rather
// than ours, so neither is added here. getCuratorExport marks the result doublecounted.
const configs = {
  methodology: 'Counts the assets deposited in every Longbow-curated vault on Robinhood Chain. Marked as double counted because those deposits are supplied into Morpho markets, which Morpho Blue already reports.',
  blockchains: {
    robinhood: {
      morphoVaultOwners: [
        '0x1bf704707e9F3f407EbC9364fDAeD08C39893770',
      ],
      morpho: [
        '0x8cb8AA35228c96C1C4E956E69AbAEBCc2aA7Dcfe',
      ],
    },
  },
}

module.exports = getCuratorExport(configs)
