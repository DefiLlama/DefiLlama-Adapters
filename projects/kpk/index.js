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

const ERC4626_ABI = {
  asset: "function asset() view returns (address)",
  totalAssets: "function totalAssets() view returns (uint256)",
  balanceOf: "function balanceOf(address account) view returns (uint256)",
  convertToAssets: "function convertToAssets(uint256 shares) view returns (uint256)",
}

// ---- Morpho vault mappings (v1 and v2 by token) ----
// Maps vault address (lowercase) to { version, type }
// Note: keys are normalized to lowercase for case-insensitive matching
const MORPHO_VAULT_MAPPINGS = {
  ethereum: {
    // USDC: v1 Prime, v2
    "0xe108fbc04852b5df72f9e44d7c29f47e7a993add": { token: null, version: "v1", type: "USDC" },
    "0x4ef53d2caa51c447fdfeeedee8f07fd1962c9ee6": { token: null, version: "v2", type: "USDC" },
    // EURC: v1 Yield, v2
    "0x0c6aec603d48ebf1cecc7b247a2c3da08b398dc1": { token: null, version: "v1", type: "EURC" },
    "0xa877d5bb0274dccba8556154a30e1ca4021a275f": { token: null, version: "v2", type: "EURC" },
    // ETH: v1 Prime, v2
    "0xd564f765f9ad3e7d2d6ca782100795a885e8e7c8": { token: null, version: "v1", type: "ETH" },
    "0xbb50a5341368751024ddf33385ba8cf61fe65ff9": { token: null, version: "v2", type: "ETH" },
  },
  arbitrum: {
    // Only v1 USDC Yield on Arbitrum
    "0x2c609d9cfc9dda2db5c128b2a665d921ec53579d": { token: null, version: "v1", type: "USDC" },
  },
}

// ---- Config (extend as needed) ----
const configs = {
  methodology:
    "Counts (1) assets deposited in curated ERC-4626 vaults and (2) collateral held in Gearbox v3.1 Credit Accounts from the specified Market Configurator. Morpho v1/v2 vaults are deduplicated to avoid double-counting.",
  blockchains: {
    ethereum: {
      // existing ERC-4626 vaults
      erc4626: [
        "0x9396dcbf78fc526bb003665337c5e73b699571ef", //Gearbox ETH
        "0xA9d17f6D3285208280a1Fd9B94479c62e0AABa64", //Gearbox wstETH
        "0xe108fbc04852B5df72f9E44d7C29F47e7A993aDd", //Morpho USDC Prime
        "0x0c6aec603d48eBf1cECc7b247a2c3DA08b398DC1", //Morpho EURC Yield
        "0xd564F765F9aD3E7d2d6cA782100795a885e8e7C8", //Morpho ETH Prime
        "0x4Ef53d2cAa51C447fdFEEedee8F07FD1962C9ee6", //Morpho v2 USDC 
        "0xa877D5bb0274dcCbA8556154A30E1Ca4021a275f", //Morpho v2 EURC
        "0xbb50a5341368751024ddf33385ba8cf61fe65ff9", //Morpho v2 ETH
      ],

      // NEW: Gearbox v3.1 Market Configurator (legacy configurator) to crawl
      gearboxMarketConfigurator: "0x1b265b97eb169fb6668e3258007c3b0242c7bdbe",
    },
    arbitrum: {
        erc4626: [
          "0x2C609d9CfC9dda2dB5C128B2a665D921ec53579d", //Morpho USDC Yield
        ],
      },
  },
}

// ---- Morpho vault deduplication logic ----

/**
 * Handles Morpho v1/v2 vault deduplication to avoid double-counting.
 * Since v2 vaults deposit into v1 vaults, we need to avoid counting v2's deposits twice.
 * 
 * The logic:
 * - v1.totalAssets() = direct deposits to v1 + v2_deposits_in_v1
 * - v2.totalAssets() = v2_all_deposits (includes v2_deposits_in_v1 + v2_deposits_elsewhere)
 * 
 * Case 1: v1 > v2
 *   - v2 deposits into v1, and v1 has additional direct deposits
 *   - Unique TVL = v1 - v2 (direct deposits to v1, excluding what v2 deposited)
 * 
 * Case 2: v2 >= v1
 *   - v2 has deposits elsewhere (e.g., Aave) in addition to what it deposited into v1
 *   - We query v1's balance of v2 shares to get v2_deposits_in_v1
 *   - Unique TVL = (v1 - v2_deposits_in_v1) + v2_all_deposits
 *   - This ensures we count: direct deposits to v1 + v2's deposits elsewhere (like Aave)
 */
async function getMorphoDeduplicatedTvl(api, chainKey, erc4626Vaults) {
  const morphoMapping = MORPHO_VAULT_MAPPINGS[chainKey]
  
  // Separate Morpho vaults from other vaults
  const morphoVaults = []
  const otherVaults = []

  if (morphoMapping) {
    for (const vault of erc4626Vaults) {
      const vaultLower = vault.toLowerCase()
      if (morphoMapping[vaultLower]) {
        morphoVaults.push(vault)
      } else {
        otherVaults.push(vault)
      }
    }
  } else {
    // No Morpho mapping for this chain, treat all as other vaults
    otherVaults.push(...erc4626Vaults)
  }

  if (morphoVaults.length === 0) {
    // No Morpho vaults, process all normally
    const assets = await api.multiCall({
      abi: ERC4626_ABI.asset,
      calls: erc4626Vaults,
      permitFailure: true,
    })
    const totalAssets = await api.multiCall({
      abi: ERC4626_ABI.totalAssets,
      calls: erc4626Vaults,
      permitFailure: true,
    })
    for (let i = 0; i < assets.length; i++) {
      if (!assets[i] || !totalAssets[i]) continue
      api.add(assets[i], totalAssets[i])
    }
    return
  }

  // Get assets and totalAssets for all Morpho vaults
  const morphoAssets = await api.multiCall({
    abi: ERC4626_ABI.asset,
    calls: morphoVaults,
    permitFailure: true,
  })
  const morphoTotalAssets = await api.multiCall({
    abi: ERC4626_ABI.totalAssets,
    calls: morphoVaults,
    permitFailure: true,
  })

  // Group by token and version
  const tokenGroups = {} // token address -> { v1: { vault, totalAssets }, v2: { vault, totalAssets } }

  for (let i = 0; i < morphoVaults.length; i++) {
    const vault = morphoVaults[i]
    const asset = morphoAssets[i]
    const totalAssets = morphoTotalAssets[i]
    const mapping = morphoMapping[vault.toLowerCase()]

    if (!asset || !totalAssets || !mapping) continue

    const tokenLower = asset.toLowerCase()
    if (!tokenGroups[tokenLower]) {
      tokenGroups[tokenLower] = {}
    }

    tokenGroups[tokenLower][mapping.version] = {
      vault,
      totalAssets: BigInt(totalAssets || 0),
    }
  }

  // Apply deduplication logic per token
  for (const [token, versions] of Object.entries(tokenGroups)) {
    const v1 = versions.v1
    const v2 = versions.v2

    if (v1 && v2) {
      // Both v1 and v2 exist - apply deduplication
      const v1Total = v1.totalAssets
      const v2Total = v2.totalAssets

      if (v1Total > v2Total) {
        // v1 > v2: v2 deposits into v1, and v1 has additional direct deposits
        // Unique TVL = v1 - v2 (direct deposits to v1, excluding what v2 deposited)
        // This avoids double-counting v2's deposits
        const uniqueTvl = v1Total - v2Total
        api.add(token, uniqueTvl)
      } else {
        // v2 >= v1: v2 has deposits elsewhere (e.g., Aave) in addition to what it deposited into v1
        // We need: Unique TVL = (v1 - v2_deposits_in_v1) + v2_all_deposits
        // To get v2_deposits_in_v1, we check v1's balance of v2 shares and convert to assets
        const v2SharesInV1 = await api.call({
          abi: ERC4626_ABI.balanceOf,
          target: v2.vault,
          params: [v1.vault],
          permitFailure: true,
        })
        
        let v2DepositsInV1 = 0n
        if (v2SharesInV1 && BigInt(v2SharesInV1) > 0n) {
          // Convert v2 shares held by v1 to underlying assets
          const v2AssetsInV1 = await api.call({
            abi: ERC4626_ABI.convertToAssets,
            target: v2.vault,
            params: [v2SharesInV1],
            permitFailure: true,
          })
          if (v2AssetsInV1) {
            v2DepositsInV1 = BigInt(v2AssetsInV1)
          }
        }
        
        // Unique TVL = (v1 - v2_deposits_in_v1) + v2_all_deposits
        // This counts: direct deposits to v1 + v2's deposits elsewhere (like Aave)
        const directDepositsToV1 = v1Total > v2DepositsInV1 ? v1Total - v2DepositsInV1 : 0n
        const uniqueTvl = directDepositsToV1 + v2Total
        api.add(token, uniqueTvl)
      }
    } else if (v1) {
      // Only v1 exists
      api.add(token, v1.totalAssets)
    } else if (v2) {
      // Only v2 exists
      api.add(token, v2.totalAssets)
    }
  }

  // Process non-Morpho vaults normally
  if (otherVaults.length > 0) {
    const assets = await api.multiCall({
      abi: ERC4626_ABI.asset,
      calls: otherVaults,
      permitFailure: true,
    })
    const totalAssets = await api.multiCall({
      abi: ERC4626_ABI.totalAssets,
      calls: otherVaults,
      permitFailure: true,
    })
    for (let i = 0; i < assets.length; i++) {
      if (!assets[i] || !totalAssets[i]) continue
      api.add(assets[i], totalAssets[i])
    }
  }
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
      // 1) ERC-4626 vault TVL with Morpho deduplication
      if (chainCfg.erc4626 && chainCfg.erc4626.length > 0) {
        await getMorphoDeduplicatedTvl(api, chainKey, chainCfg.erc4626)
      }

      // 2) Other curated vaults (morpho, euler, silo, etc.) - if any
      const otherVaultConfig = { ...chainCfg }
      delete otherVaultConfig.erc4626 // Remove erc4626 as we handle it separately
      delete otherVaultConfig.gearboxMarketConfigurator // Remove gearbox config
      
      // Only call getCuratorTvl if there are other vault types
      const hasOtherVaults = Object.keys(otherVaultConfig).length > 0
      if (hasOtherVaults) {
        await getCuratorTvl(api, otherVaultConfig)
      }

      // 3) Gearbox v3.1 Credit Account collateral TVL for the given configurator
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
