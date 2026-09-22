const { getCuratorExport } = require("../helper/curators")
const { sumTokensDebank } = require("../helper/debank")
const { getCache } = require("../helper/cache")
const { dydxLiveTvl, dydxHistoricalTvl } = require("./dydx")

// ---- Minimal ABIs / constants from Gearbox v3.1 adapter ----
const DEFILLAMA_COMPRESSOR_V310 = "0x81cb9eA2d59414Ab13ec0567EFB09767Ddbe897a"
const ETH_ALPHA_SAFE = "0x99b9F5F24205Cb88E33b1CC72008f644Fc23768b" // ETH Alpha Fund Portfolio Safe
const USD_ALPHA_SAFE = "0x38F6a1B46144fAEe6a6D9F79D8dE264C18e23848" // USD Alpha Fund Portfolio Safe

const GearboxCompressorABI = {
  // returns credit managers associated with the given legacy (market) configurators
  getLegacyCreditManagers:
    "function getCreditManagers(address[] memory configurators) external view returns (address[] memory creditManagers)",

  // pages credit accounts of a specific credit manager
  getCreditAccounts:
    "function getCreditAccounts(address creditManager, uint256 offset, uint256 limit) external view returns (tuple(address creditAccount, uint256 debt, tuple(address token, uint256 balance)[] tokens)[] memory data)",
}

// ---- Config (extend as needed) ----
const configs = {
  methodology:
    "Sum of curated vault deposits (Morpho, Aleph, Euler, Gearbox), Gearbox v3.1 credit account collateral, kpk Fund AUM, positions in Safes actively managed by kpk via Zodiac Roles Modifier, and the dYdX mandate's DYDX delegated, unbonding and held on dYdX chain.",
  blockchains: {
    ethereum: {
      // Option 1: Use morphoVaultOwners to dynamically get all Morpho vaults owned by these addresses
      // (vaults are discovered from event logs, and de-duplication is automatically applied)
      morphoVaultOwners: [
        // Add owner addresses here to discover all their Morpho vaults
        // Example: '0x0000aeB716a0DF7A9A1AAd119b772644Bc089dA8',
      ],

      // Option 2: Use morpho: to specify static Morpho vault addresses
      // (de-duplication is automatically applied)
      // You can use BOTH morphoVaultOwners and morpho together - they will be combined
      morpho: [
        "0xe108fbc04852B5df72f9E44d7C29F47e7A993aDd", //Morpho v1 USDC Prime
        "0x0c6aec603d48eBf1cECc7b247a2c3DA08b398DC1", //Morpho v1 EURC Yield
        "0xd564F765F9aD3E7d2d6cA782100795a885e8e7C8", //Morpho v1 ETH Prime
        "0x4Ef53d2cAa51C447fdFEEedee8F07FD1962C9ee6", //Morpho v2 USDC Prime
        "0x1a1985F50352b58090eb36425AfdFacbaC7806F4", //Morpho v2 USDC Prime Core
        "0xa877D5bb0274dcCbA8556154A30E1Ca4021a275f", //Morpho v2 EURC Yield
        "0xbb50a5341368751024ddf33385ba8cf61fe65ff9", //Morpho v2 ETH Prime
        "0x5dbf760b4fd0cDdDe0366b33aEb338b2A6d77725", //Morpho v2 ETH Yield
        "0xc88eFFD6e74D55c78290892809955463468E982A", //Morpho v1 ETH Yield
        "0xD5cCe260E7a755DDf0Fb9cdF06443d593AaeaA13", //Morpho v2 USDC Yield
        "0x9178eBE0691593184c1D785a864B62a326cc3509", //Morpho v1 USDC Yield
        "0xdaD4e51d64c3B65A9d27aD9F3185B09449712065", //Morpho v1 USDT Prime
        "0x870F0BF29A25A40E7CC087cD5C53e70C11F2C8A8", //Morpho v2 USDT Prime
        "0xb5ce3CA2C774b72955C25875022FdD91f7a7B938", //Morpho v2 wARS Yield
        "0x6251482812cE95d11b3E447FE6888b1a1bE66C25", //Morpho v2 EURe Yield
        "0x7a72bcD2c3F7F7e4D6679170a0625bAB15D7DDa1", //Morpho v2 USDC Yield RWA
      ],

      // Other ERC-4626 vaults (non-Morpho)
      erc4626: [
        "0x2B47c128b35DDDcB66Ce2FA5B33c95314a7de245", //kpk USDC Prime RWA (Euler Earn)
        "0x8BcD746976885b5832bAD07B4921E3f2dD1D3703", //kpk USDC RWA Liquidity (Symbiotic v2 Liquid Lane)
        "0xB6D6D89ad4b4D61C15a293e28b74f77F6817fF48", //kpk ETH Yield Term (Euler Earn)
        "0x9396dcbf78fc526bb003665337c5e73b699571ef", //Gearbox ETH
        "0xA9d17f6D3285208280a1Fd9B94479c62e0AABa64", //Gearbox wstETH
      ],

      // Upshift multiAssetVault: non-ERC4626, exposes asset() + getTotalAssets()
      upshiftV2: [
        "0x00E95754322D15aB8765961c6Ac5682B9282F54F", //kpk Upshift lsETH
      ],

      // Aleph vaults use underlyingToken() instead of asset(), so they
      // can't go through the standard ERC-4626 curator helper.
      alephVaults: [
        "0x9477df934574d47f240e18cd232e013118666690", //kpk Aleph rETH
        "0xf857caa91ea4007ec26aee2d039e870eb0fa91bf", //kpk Aleph stETH
        "0x6cbcc646d7422b734c6fc0954a1c3ca87b1b4ceb", //kpk Aleph osETH
      ],


      // NEW: Gearbox v3.1 Market Configurator (legacy configurator) to crawl
      gearboxMarketConfigurator: "0x1b265b97eb169fb6668e3258007c3b0242c7bdbe",
      gearboxFromBlock: 23282412,
    },
    arbitrum: {
      // You can use either morphoVaultOwners or morpho here too
      morpho: [
        "0x2C609d9CfC9dda2dB5C128B2a665D921ec53579d", //Morpho USDC Yield
        "0x5837e4189819637853a357aF36650902347F5e73", //Morpho USDC Yield v2
      ],
    },
  },
}

// ---- Gearbox v3.1 credit-account collateral TVL ----

async function getGearboxV31Collateral(api, marketConfigurator, fromBlock, pageSize = 1e3) {
  if (!marketConfigurator) return
  // skipped at blocks before the configurator existed.
  if (fromBlock && api.block && api.block < fromBlock) return

  // fetch credit managers associated with this configurator
  const creditManagers = await api.call({
    abi: GearboxCompressorABI.getLegacyCreditManagers,
    target: DEFILLAMA_COMPRESSOR_V310,
    params: [[marketConfigurator]],
  })
  if (!creditManagers?.length) return

  // page through credit accounts for each CM
  for (const cm of creditManagers) {
    let offset = 0
    while (true) {
      const accounts = await api.call({
        abi: GearboxCompressorABI.getCreditAccounts,
        target: DEFILLAMA_COMPRESSOR_V310,
        params: [cm, offset, pageSize],
        permitFailure: true,
      })

      if (!accounts || !accounts.length) break
      offset += accounts.length

      // keep only accounts with non-zero debt (active)
      for (const acc of accounts) {
        if (!acc) continue
        const hasDebt = BigInt(acc.debt || 0n) !== 0n
        if (!hasDebt) continue

        // Add each token balance in the account as collateral TVL
        // Imitates Gearbox's internal adapter filter: ignore ~dust (<= 1)
        for (const t of (acc.tokens || [])) {
          if (!t?.token || t.balance == null) continue
          try {
            if (BigInt(t.balance) > 1n) api.add(t.token, t.balance)
          } catch {
            // in case a malformed balance slips through, just skip it
          }
        }
      }

      // stop if this page was not full
      if (accounts.length < pageSize) break
    }
  }
}

// ---- Aleph vault TVL (uses underlyingToken() instead of asset()) ----

async function getAlephVaultTvl(api, vaults) {
  if (!vaults?.length) return
  const underlyingTokens = await api.multiCall({ abi: "address:underlyingToken", calls: vaults, permitFailure: true })
  const totalAssets = await api.multiCall({ abi: "uint256:totalAssets", calls: vaults, permitFailure: true })
  for (let i = 0; i < vaults.length; i++) {
    if (underlyingTokens[i] && totalAssets[i]) api.add(underlyingTokens[i], totalAssets[i])
  }
}

// ---- kpk Fund (OIV) TVL via DeBank ----
const OIV_SAFES = [ETH_ALPHA_SAFE, USD_ALPHA_SAFE]
const OIV_CHAINS = ['ethereum', 'arbitrum', 'base', 'xdai', 'optimism']

// ---- Zodiac-managed Safes (Institutional vertical) TVL via DeBank ----
// Safes owned by external institutions but actively managed by kpk via Zodiac Roles Modifier.
const ZODIAC_MANAGED_SAFES = [
  '0x4F2083f5fBede34C2714aFfb3105539775f7FE64', // ENS Endowment Fund
  '0x616dE58c011F8736fa20c7Ae5352F7f6FB9F0669', // CoW Main Treasury
  '0x7F8987D6A8bee31bD7bE80E877732579E2582a28', // CoW Defense Fund
  '0x9009B4411D0e1171cc042b77D7701f46B737Fdb9', // CoW Validator Safe
  '0x523732d31b4432bcdd4baad108f7ebe54ad478b0', // CoW TWAP Safe
  '0x4D1D9D7741740A3E2ffC5507aC643DbA5e81cAe5', // Arbitrum DAO
  '0x8e53D04644E9ab0412a8c6bd228C84da7664cFE3', // Nexus Mutual
  '0xe7f2C930d6c64B91b96cd46C2933885765810A8E', // dYdX wallet (eth/arb)
  '0xd97eCe4a24C4538d96E14296c5544c871caE2eEB', // dYdX wallet (eth) - USDY + kpk USDC Prime Core V2
]
const ZODIAC_CHAINS = ['ethereum', 'arbitrum', 'base', 'xdai', 'optimism', 'bsc', 'polygon', 'avax']

// ---- Historical Zodiac mandate TVL from the kpk treasury IR cache ----
//
// DeBank only answers for the current block, so a refill cannot backdate the Zodiac
// sweep above. utils/scripts/kpkTreasuryIR.js prices the same mandate Safes fully
// on-chain, once a day at 00:00 UTC, and stores one record per date under this key
// (see STORE_KEY there). Each record's `chains` map is the per-chain USD figure of
// the mandates with their kpk-curated vault shares already removed, which is the same
// exclusion the DeBank sweep applies through blacklistedPools - so the two figures
// are meant to be interchangeable, DeBank for today and the store for any earlier day.
//
// The store is mandates ONLY: no curated vaults, no Gearbox/Aleph, no OIV fund Safes,
// no dYdX chain. Vaults, Gearbox and Aleph keep running from their own on-chain
// sources at historical blocks, and the dYdX chain has its own source (see dydx.js).
// The OIV Safes have no historical source and are skipped on past dates: they only
// exist since 2026-03 and production has tracked them via DeBank since 2026-06-16, so
// a refill of the history before that loses nothing. From that date on the stored
// days are already complete and a historical run would REPLACE them with a total
// missing the OIV Safes, so the historical path refuses those dates. A refill writes
// every chain of a date at once, so the dYdX chain is bound by the same cutoff.
const IR_CACHE_PROJECT = 'kpk-treasury-ir'
const IR_CACHE_FILE = 'daily'
const HISTORICAL_CUTOFF = '2026-06-16' // first day production tracked the OIV Safes

let irStorePromise
function loadIrStore() {
  if (!irStorePromise) irStorePromise = getCache(IR_CACHE_PROJECT, IR_CACHE_FILE)
  return irStorePromise
}

const utcDate = (timestamp) => new Date(timestamp * 1e3).toISOString().slice(0, 10)

// A run for any day but today is a historical run (a refill); today's is the live one.
function isHistoricalRun(api) {
  const date = utcDate(api.timestamp)
  if (date === utcDate(Math.floor(Date.now() / 1e3))) return false
  if (date >= HISTORICAL_CUTOFF)
    throw new Error(`kpk: ${date} is on or after ${HISTORICAL_CUTOFF}, when production started tracking the OIV Safes live. There is no historical source for them, so refilling this date would overwrite a complete day with a partial one - refill dates before the cutoff only`)
  return true
}

async function getZodiacTvlFromCache(api) {
  const date = utcDate(api.timestamp)
  const store = await loadIrStore()
  const record = store?.dates?.[date]
  // throw rather than write a zero into the chart: a missing day is a gap to be
  // filled by the IR cache job, not a day on which the mandates held nothing
  if (!record) throw new Error(`kpk: no IR cache record for ${date} (run utils/scripts/kpkTreasuryIR.js --cache)`)
  const usd = record.chains?.[api.chain]
  if (usd === undefined) return // chain was not part of the sweep on that date
  api.addUSDValue(usd)
}

// Returns all kpk curated vaults to use as blacklistedPools in DeBank calls to avoid
// double counting positions already captured by the curator export's totalAssets()
function getCuratedVaults(chain) {
  const cfg = configs.blockchains[chain]
  if (!cfg) return []
  return [...(cfg.morpho || []), ...(cfg.erc4626 || []), ...(cfg.alephVaults || []), ...(cfg.upshiftV2 || [])]
}

async function getDebankTvl(api, safes) {
  await sumTokensDebank(api, safes, { includeWalletTokens: true, blacklistedPools: getCuratedVaults(api.chain) })
}

// ---- Combined TVL export per chain ----

const allChains = [...new Set([...Object.keys(configs.blockchains), ...OIV_CHAINS, ...ZODIAC_CHAINS])]
const exportObjects = getCuratorExport(configs)

for (const chain of allChains) {
  const curatorTvl = exportObjects[chain]?.tvl
  exportObjects[chain] = {
    tvl: async (api) => {
      // Curated vault deposits (Morpho, Euler, etc.) via getCuratorExport
      if (curatorTvl) await curatorTvl(api)

      // Gearbox v3.1 credit account collateral + Aleph vault TVL
      const chainCfg = configs.blockchains[chain]
      const hasGearbox = chainCfg?.gearboxMarketConfigurator
      const hasAleph = chainCfg?.alephVaults
      if (hasGearbox) await getGearboxV31Collateral(api, hasGearbox, chainCfg.gearboxFromBlock)
      if (hasAleph) await getAlephVaultTvl(api, hasAleph)

      const historical = isHistoricalRun(api)

      // kpk Fund (OIV) TVL via DeBank - current block only
      if (OIV_CHAINS.includes(chain) && !historical) await getDebankTvl(api, OIV_SAFES)

      // Zodiac-managed Safe TVL: DeBank for today, the on-chain IR cache for any past date
      if (ZODIAC_CHAINS.includes(chain)) {
        if (historical) await getZodiacTvlFromCache(api)
        else await getDebankTvl(api, ZODIAC_MANAGED_SAFES)
      }
    }
  }
}

// dYdX chain: the LCD today, today's anchor walked back through Allium for any past date
exportObjects.dydx = {
  tvl: async (api) => isHistoricalRun(api) ? dydxHistoricalTvl(api) : dydxLiveTvl(api),
}

module.exports = exportObjects
