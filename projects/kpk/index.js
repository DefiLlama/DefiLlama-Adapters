const { getCuratorTvl } = require("../helper/curators")

// ---- Minimal ABIs / constants from Gearbox v3.1 adapter ----
const DEFILLAMA_COMPRESSOR_V310 = "0x81cb9eA2d59414Ab13ec0567EFB09767Ddbe897a"

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
    "Counts (1) assets deposited in curated ERC-4626 vaults and (2) collateral held in Gearbox v3.1 Credit Accounts from the specified Market Configurator.",
  blockchains: {
    ethereum: {
      // your existing ERC-4626 vaults
      erc4626: [
        "0x9396dcbf78fc526bb003665337c5e73b699571ef",
        "0xA9d17f6D3285208280a1Fd9B94479c62e0AABa64",
      ],

      // NEW: Gearbox v3.1 Market Configurator (legacy configurator) to crawl
      gearboxMarketConfigurator: "0x1b265b97eb169fb6668e3258007c3b0242c7bdbe",
    },
  },
}

// ---- Gearbox v3.1 credit-account collateral TVL ----

async function getGearboxV31Collateral(api, marketConfigurator, pageSize = 1e3) {
  if (!marketConfigurator) return

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

// ---- Combined TVL export per chain ----

function buildChainExport(chainKey, chainCfg) {
  return {
    tvl: async (api) => {
      // 1) Curated vault TVL (ERC-4626 etc.)
      await getCuratorTvl(api, chainCfg)

      // 2) Gearbox v3.1 Credit Account collateral TVL for the given configurator
      if (chainCfg.gearboxMarketConfigurator)
        await getGearboxV31Collateral(api, chainCfg.gearboxMarketConfigurator)
    },
  }
}

const exportObjects = {
  doublecounted: true,
  methodology: configs.methodology,
}

for (const [chain, chainCfg] of Object.entries(configs.blockchains)) {
  exportObjects[chain] = buildChainExport(chain, chainCfg)
}

module.exports = exportObjects
