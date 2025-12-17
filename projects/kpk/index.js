const { getCuratorExport } = require("../helper/curators")

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
    "Counts (1) assets deposited in curated ERC-4626 vaults and (2) collateral held in Gearbox v3.1 Credit Accounts from the specified Market Configurator. Morpho v1/v2 vaults are deduplicated to avoid double-counting.",
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
        "0xe108fbc04852B5df72f9E44d7C29F47e7A993aDd", //Morpho USDC Prime (v1)
        "0x0c6aec603d48eBf1cECc7b247a2c3DA08b398DC1", //Morpho EURC Yield (v1)
        "0xd564F765F9aD3E7d2d6cA782100795a885e8e7C8", //Morpho ETH Prime (v1)
        "0x4Ef53d2cAa51C447fdFEEedee8F07FD1962C9ee6", //Morpho v2 USDC 
        "0xa877D5bb0274dcCbA8556154A30E1Ca4021a275f", //Morpho v2 EURC
        "0xbb50a5341368751024ddf33385ba8cf61fe65ff9", //Morpho v2 ETH
      ],

      // Other ERC-4626 vaults (non-Morpho)
      erc4626: [
        "0x9396dcbf78fc526bb003665337c5e73b699571ef", //Gearbox ETH
        "0xA9d17f6D3285208280a1Fd9B94479c62e0AABa64", //Gearbox wstETH
      ],

      // NEW: Gearbox v3.1 Market Configurator (legacy configurator) to crawl
      gearboxMarketConfigurator: "0x1b265b97eb169fb6668e3258007c3b0242c7bdbe",
    },
    arbitrum: {
        // You can use either morphoVaultOwners or morpho here too
        morpho: [
          "0x2C609d9CfC9dda2dB5C128B2a665D921ec53579d", //Morpho USDC Yield
        ],
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

const exportObjects = getCuratorExport(configs)

// Add Gearbox v3.1 collateral TVL to each chain
for (const [chain, chainCfg] of Object.entries(configs.blockchains)) {
  if (exportObjects[chain] && chainCfg.gearboxMarketConfigurator) {
    const originalTvl = exportObjects[chain].tvl
    exportObjects[chain].tvl = async (api) => {
      await originalTvl(api)
      await getGearboxV31Collateral(api, chainCfg.gearboxMarketConfigurator)
    }
  }
}

module.exports = exportObjects