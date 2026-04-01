const { getCuratorExport } = require("../helper/curators")
const { sumTokens2, unwrapConvexRewardPools } = require("../helper/unwrapLPs")

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
    "Sum of curated vault deposits (Morpho, Aleph, Euler, Gearbox), Gearbox v3.1 credit account collateral, and kpk Fund AUM via onchain NAV Calculators.",
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
        "0xa877D5bb0274dcCbA8556154A30E1Ca4021a275f", //Morpho v2 EURC Yield
        "0xbb50a5341368751024ddf33385ba8cf61fe65ff9", //Morpho v2 ETH Prime
        "0x5dbf760b4fd0cDdDe0366b33aEb338b2A6d77725", //Morpho v2 ETH Yield
        "0xc88eFFD6e74D55c78290892809955463468E982A", //Morpho v1 ETH Yield
        "0xD5cCe260E7a755DDf0Fb9cdF06443d593AaeaA13", //Morpho v2 USDC Yield
        "0x9178eBE0691593184c1D785a864B62a326cc3509", //Morpho v1 USDC Yield
        "0xdaD4e51d64c3B65A9d27aD9F3185B09449712065", //Morpho v1 USDT Prime
        "0x870F0BF29A25A40E7CC087cD5C53e70C11F2C8A8", //Morpho v2 USDT Prime
      ],

      // Other ERC-4626 vaults (non-Morpho)
      erc4626: [
        "0x2B47c128b35DDDcB66Ce2FA5B33c95314a7de245", //kpk RWA Euler USDC Earn
        "0x9396dcbf78fc526bb003665337c5e73b699571ef", //Gearbox ETH
        "0xA9d17f6D3285208280a1Fd9B94479c62e0AABa64", //Gearbox wstETH
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

// ---- Aleph vault TVL (uses underlyingToken() instead of asset()) ----

async function getAlephVaultTvl(api, vaults) {
  if (!vaults?.length) return
  const underlyingTokens = await api.multiCall({ abi: "address:underlyingToken", calls: vaults, permitFailure: true })
  const totalAssets = await api.multiCall({ abi: "uint256:totalAssets", calls: vaults, permitFailure: true })
  for (let i = 0; i < vaults.length; i++) {
    if (underlyingTokens[i] && totalAssets[i]) api.add(underlyingTokens[i], totalAssets[i])
  }
}

// ---- kpk Fund (OIV) TVL via NAV Calculator ----
const ETH_ALPHA_FUND_CONFIG = {
  portfolioSafe: "0x99b9F5F24205Cb88E33b1CC72008f644Fc23768b",
  ethereum: {
    tokens: [
      '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee', // weETH
      '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', // wstETH
      '0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7', // rsETH
      '0x2D62109243b87C4bA3EE7bA1D91B0dD0A074d7b1', // aEthrsETH
      '0xeA51d7853EEFb32b6ee06b1C12E6dcCA88Be0fFE', // aave debt
      '0xA9d17f6D3285208280a1Fd9B94479c62e0AABa64', // Gearbox dwstETHV3
    ],
  }
}

async function getKpkFundTvl(api) {
  const chainCfg = ETH_ALPHA_FUND_CONFIG[api.chain]
  if (!chainCfg) return

  await sumTokens2({ api, owner: ETH_ALPHA_FUND_CONFIG.portfolioSafe, tokens: chainCfg.tokens })
}

// ---- Combined TVL export per chain ----

const exportObjects = getCuratorExport(configs)

// Add Gearbox v3.1 collateral + Aleph vault TVL to each chain
for (const [chain, chainCfg] of Object.entries(configs.blockchains)) {
  if (exportObjects[chain] && (chainCfg.gearboxMarketConfigurator || chainCfg.alephVaults)) {
    const originalTvl = exportObjects[chain].tvl
    exportObjects[chain].tvl = async (api) => {
      await originalTvl(api)
      await getGearboxV31Collateral(api, chainCfg.gearboxMarketConfigurator)
      await getAlephVaultTvl(api, chainCfg.alephVaults)
    }
  }
}

// Add kpk Fund (OIV) TVL to each chain the fund is deployed on
for (const chain of Object.keys(ETH_ALPHA_FUND_CONFIG).filter(k => k !== 'portfolioSafe')) {
  if (exportObjects[chain]) {
    const originalTvl = exportObjects[chain].tvl
    exportObjects[chain].tvl = async (api) => {
      await originalTvl(api)
      await getKpkFundTvl(api)
    }
  } else {
    exportObjects[chain] = { tvl: getKpkFundTvl }
  }
}

module.exports = exportObjects