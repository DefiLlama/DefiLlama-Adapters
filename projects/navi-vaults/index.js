const sui = require("../helper/chain/sui")

// NAVI Vault (`navi_vault`) on Sui - every production vault of the product.
//
// Sources a reviewer can open:
//   vault list (public, no auth)  https://open-api.naviprotocol.io/api/vaults
//   the public SDK that reads it  https://github.com/naviprotocol/naviprotocol-monorepo
//                                 (`packages/vault`, `getVaults()`; npm
//                                 `@naviprotocol/vault`)
//
// On-chain deployment:
//   packageId (current call target)   0x13e1e0ddcf3a76cde006d530e98a0f985c446013cfedeae6dd067a2f1ea88ff5
//   originalPackageId (type prefix)   0x51cecaacaed0bd436f04ebbd8ba0ca1627c9c4d0e54ad28eff095ca78591518c
//   module navi_vault, struct Vault<CoinType>
//
// The object ids are listed explicitly instead of enumerated with
// `getObjectsByType`, because the author of this adapter could not reach
// `https://open-api.naviprotocol.io/api/vaults` from the environment it was
// written in and so could not verify what that endpoint returns; an explicit
// list of ids whose balances are read on-chain was preferred over a parse of an
// unverified response. The tradeoff is a stale-list risk: a vault NAVI launches
// later is missing from this TVL until an id is added here, and the endpoint
// above is the maintained source to diff this list against.
//
// "Prime" and "High Yield" in the names below are NAVI's off-chain product
// labels over one contract - nothing on-chain distinguishes them - so they are
// kept as comments and do not split this listing.
const VAULTS = [
  {
    id: "0x908c978d1a007aec4bcdc8233a0273de27ab059b9e6611bdad083457abb7f062",
    name: "USDC Prime", // Vault<0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC>
  },
  {
    id: "0x01236ff6c66c0c668950f9702629b42f372bf478793d055d2a7eca15e0b0d1e7",
    name: "SUI Prime", // Vault<0x2::sui::SUI>
  },
  {
    id: "0x54359eb5d0e4364bd26989899fdb472f5594d1885e1f0d816ef4a066cab2ae4c",
    name: "USDC High Yield", // Vault<0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC>
  },
  {
    id: "0x864527a8ed2435aed828b46c6d9d0244506b418761cca25b7dd47a83c7797a29",
    name: "SUI High Yield", // Vault<0x2::sui::SUI>
  },
]

async function tvl(api) {
  const vaults = await sui.getObjects(VAULTS.map((v) => v.id))

  vaults.forEach((vault, i) => {
    const { id, name } = VAULTS[i]
    if (!vault) throw new Error(`NAVI Vaults: vault object not found: ${name} (${id})`)

    // `Vault<CoinType>` -> `CoinType`. No fallback: a type string that does not
    // parse means the object is not the vault this list claims it is, and
    // throwing is better than adding a balance under an assumed coin type.
    const coinType = vault.type?.replace(">", "").split("<")[1]
    if (!coinType) throw new Error(`NAVI Vaults: could not resolve coin type for ${name} (${id})`)

    // `total_assets` (u64, base units) is the vault's whole book: its idle
    // balance plus everything it has supplied into NAVI's lending markets. It
    // is a stored value the contract refreshes when a market balance is synced
    // (every deposit and withdraw does), so it trails lending interest accrued
    // since that sync. The vaults have no borrow entrypoint, so nothing is
    // netted out.
    const totalAssets = vault.fields?.total_assets
    if (totalAssets === undefined) throw new Error(`NAVI Vaults: total_assets missing on ${name} (${id})`)

    api.add(coinType, totalAssets)
  })
}

module.exports = {
  timetravel: false,
  // The vaults supply into NAVI's own lending markets, so this TVL overlaps the
  // existing `navi` listing. The overlap is not exact: `projects/navi/index.js`
  // reports each market's `total_supply - borrowed`, so the borrowed slice of
  // the vaults' assets is not in that listing's tvl, and `idle_balance` sits in
  // the vault object rather than in a market. The flag is all-or-nothing, and
  // flagging the whole book under-reports rather than over-reports.
  doublecounted: true,
  methodology:
    "Sums the `total_assets` field of NAVI's four navi_vault objects on Sui (USDC and SUI, across NAVI's Prime and High Yield product lines), read directly from each vault object. `total_assets` is a vault's idle balance plus the assets it has supplied into NAVI's lending markets, as of that vault's last market sync - it is a stored balance refreshed when a market balance is synced, so lending interest accrued since then is not yet included. The vaults do not borrow, so nothing is netted out. Marked as double counted because the supplied assets are also part of the NAVI lending market TVL reported by the `navi` listing.",
  sui: {
    tvl,
  },
}
