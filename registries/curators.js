const { getCuratorExport } = require('../projects/helper/curators')

// Adapters whose only export is getCuratorExport(config) (optionally with extra
// top-level metadata). Each entry holds the raw config object passed to getCuratorExport,
// plus any extra top-level keys under _meta.
const configs = {
  "9summits": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by 9Summits.',
      blockchains: {
        ethereum: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
          morpho: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // co-curator with tulip-capital
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // co-curator with tulip-capital
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // co-curator with tulip-capital
          ],
          turtleclub: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        base: {
          morphoVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        unichain: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
      }
    },
  },
  "Greenhouse-Finance": {
    config: {
      methodology: 'Count all assets deposited in Greenhouse curated vaults.',
      blockchains: {
        arbitrum: {
          siloVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        sonic: {
          siloVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
      }
    },
  },
  "alphaping": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by Alphaping.',
      blockchains: {
        ethereum: {
          morphoVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
      }
    },
  },
  "alterscope": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by Alterscope.',
      blockchains: {
        ethereum: {
          eulerVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        base: {
          eulerVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'
          ]
        },
        starknet: {
          vesu: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
      }
    },
    _meta: {
      timetravel: false,
      hallmarks: [
        ['2025-06-01', "Start tracking vaults on starknet"],
      ],
    },
  },
  "anthias": {
    config: {
      methodology: 'Count all assets deposited in all vaults curated by Anthias Labs.',
      start: '2025-05-27', // https://snapshot.box/#/s:moonwell-governance.eth/proposal/0x38bba3ecc2c5421f7660e124a8d874c70485aec16b2097520cf8fd217efca86d
      blockchains: {
        base: {
          morpho: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
      }
    },
  },
  "apostro": {
    config: {
      methodology: 'Count all assets are depoisted in all vaults curated by Apostro.',
      blockchains: {
        ethereum: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
          eulerVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        base: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
          eulerVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        bsc: {
          eulerVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
      }
    },
  },
  "armitage": {
    config: {
      methodology: 'Counts all assets that are deposited in all vaults curated by Armitage.',
      blockchains: {
        ethereum: {
          morpho: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
      },
    },
  },
  "avantgarde": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by Avantgarde.',
      blockchains: {
        ethereum: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
      }
    },
  },
  "b-protocol": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by B protocol.',
      blockchains: {
        ethereum: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            // '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Anthias is now curator for Moonwell's Morpho vaults
          ],
        },
        base: {
          morphoVaultOwners: [
            // '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Anthias is now curator for Moonwell's Morpho vaults: https://x.com/MoonwellDeFi/status/1928491680031969510
          ],
        },
      }
    },
  },
  "blend": {
    config: {
      methodology: 'Count all assets are deposited in all vaults allocated by Blend Protocol.',
      blockchains: {
        btnx: {
          erc4626: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE'
          ],
          nestedVaults: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'
          ]
        },
        scroll: {
          erc4626: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'
          ],
          nestedVaults: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ]
        },
        arbitrum: {
          erc4626: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'
          ],
        }
      },
      // deadFrom: 'xxx', // https://github.com/DefiLlama/DefiLlama-Adapters/pull/18409 - shifting focus to tradfi rails
    },
  },
  "cassa": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by Cassa.',
      blockchains: {
        ethereum: {
          euler: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'
          ],
        },
      },
    },
  },
  "cian-curating": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by CIAN Protocol.',
      blockchains: {
        ethereum: {
          turtleclub_erc4626: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
      }
    },
  },
  "clearstar": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by Clearstar.',
      blockchains: {
        base: {
          morphoVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
          eulerVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
          erc4626: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // yoUSD IPOR Fusion
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // yoETH IPOR Fusion
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // ETH Lending Optimizer IPOR Fusion
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // cbETH Looper IPOR Fusion
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // USDC Lending Optimizer IPOR Fusion
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // wETH Metavault on Spectra
          ],
        },
        ethereum: {
          morphoVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
          erc4626: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // YieldFi yPrism
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // IPOR Fusion yoGOLD
          ],
          upshiftV2: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Upshift Wildcat USD
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // Upshift LiquityV2
          ],
        },
        polygon: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        unichain: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        katana: {
          morphoVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
          erc4626: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // vbUSDC Metavault on Spectra
          ],
        },
        monad: {
          morphoVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
          eulerVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        arbitrum: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        hemi: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'
          ],
        },
        hyperliquid: {
          eulerVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' // HypurrFi / Euler HyperEVM vaults
          ],
        },
        starknet: {
          vesuV2: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE' // Clearstar USDC Reactor
          ],
        },
        flare: {
          morpho: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Core USDT0 Vault on Mystic
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // Core wFLR Vault on Mystic
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Core FXRP Vault on Mystic
          ],
          upshiftV2: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Upshift FXRP
          ],
        },
      }
    },
    _meta: {
      timetravel: false, // starknet doesn't support historical queries
      hallmarks: [
        ['2026-02-10', "Start tracking Vesu V2 vaults on Starknet"],
      ],
      hallmarks: [
        ['2026-02-10', "Start tracking Vesu V2 vaults on Starknet"],
      ],
    },
  },
  "cozy-v3": {
    config: {
      methodology: "Count all assets deposited in Euler vaults curated by Cozy.",
      blockchains: {
        ethereum: {
          eulerVaultOwners: ["0x3211d27a1A1B8E40C7974F6951935303e6e56DBE"],
        },
      },
    },
  },
  "edge-capital": {
    config: {
      methodology: 'Counts all assets deposited in vaults curated by Muscadine.',
      blockchains: {
        tac: {
          eulerVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
      }
    },
  },
  "feather": {
    config: {
      blockchains: {
        ethereum: {
          morpho: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Feather USDC vault
          ],
        },
        sei: {
          morpho: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        celo: {
          morphoVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        klaytn: {
          morphoVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
      }
    },
    _meta: {
      methodology: 'Counts all assets that are deposited in all vaults curated by Feather.',
    },
  },
  "fence": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by Fence.',
      blockchains: {
        ethereum: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
      }
    },
  },
  "galaxy": {
    config: {
      methodology: "TVL is calculated by summing the assets deposited in all Morpho vaults curated by Galaxy on each supported chain.",
      blockchains: {
        ethereum: {
          morphoVaultOwners: ["0x46531ea0E7cec64b14181d45F8C6798a1cE45da1"],
        },
        base: {
          morphoVaultOwners: ["0x3211d27a1A1B8E40C7974F6951935303e6e56DBE"],
        },
      },
    },
  },
  "gami-labs": {
    config: {
      methodology:
        "Count all assets deposited in all vaults curated by Gami Labs across Lagoon, Spectra, Silo, Gearbox, and Upshift.",
      blockchains: {
        ethereum: {
          erc4626: [
            // Lagoon
            "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1", // Lagoon - Gami USDC
            "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE", // Lagoon - Gami Stake DAO USDC
            "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE", // Lagoon - Gami WBTC
            "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1", // Lagoon - xBTCY (cbBTC)
            "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE", // Lagoon - Gami hemiBTC
            "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1", // Lagoon - Gami ETH (WETH)
            "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE", // Lagoon - Coinshift USPC Prime
            "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1", // Lagoon - Coinshift Leveraged USPC
            // Gearbox
            "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1", // Gearbox - Gami WBTC
          ],
        },
        base: {
          erc4626: [
            "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1", // Spectra - Gami Spectra USDC
          ],
        },
        flare: {
          erc4626: [
            "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1", // Spectra - Flare XRP Yield Prime
          ],
        },
        hemi: {
          erc4626: [
            "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE", // Lagoon - Hemi USDC
          ],
        },
        avax: {
          erc4626: [
            "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE", // Lagoon - USDC Avalanche Core
          ],
          silo: [
            "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1", // Silo - Gami Silo USDC
            "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE", // Silo - Gami Silo AVAX
          ],
        },
        stellar: {
          upshiftStellar: [
            "CCL3WITWFFXIHV2I52ECV5DPIEOFSTU3PBPR53ILPLF2IP5KHECXRUTY", // Upshift - Gami earnUSDC
            "CC6TRAPQD3NK7THUKWPV5SL2JHKQGNXZVB6S6MVYFSLRWAKEFUWZKZ7J", // Upshift - Gami earnXLM
          ],
        },
      },
    },
  },
  "hakutora": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by Hakutora.',
      blockchains: {
        ethereum: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
      }
    },
  },
  "invariant-group": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by Invariant Group.',
      blockchains: {
        ethereum: {
          erc4626: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        plasma: {
          erc4626: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        hemi: {
          erc4626: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', '0xD172B64AA13d892bb5EB35f3482058eAE0BC5B2a',
          ]
        }
      }
    },
  },
  "keyring": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by Keyring Network.',
      blockchains: {
        avax: {
          eulerVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
      }
    },
  },
  "llamarisk": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by Llama Risk.',
      blockchains: {
        ethereum: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
      }
    },
  },
  "m11c": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by M11C.',
      blockchains: {
        ethereum: {
          morphoVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
      }
    },
  },
  "muscadine": {
    config: {
      methodology: 'Counts all assets deposited in Muscadine Morpho vaults on Base.',
      blockchains: {
        base: {
          morpho: [
            // V1 Vaults
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Muscadine USDC Vault
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // Muscadine cbBTC Vault
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Muscadine WETH Vault
            // V2 Vaults
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // Muscadine USDC Prime
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Muscadine WETH Prime
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // Muscadine cbBTC Prime
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // Muscadine USDC Frontier
          ],
        },
      }
    },
  },
  "ouroboros": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by Ouroboros Capital.',
      blockchains: {
        ethereum: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
          eulerVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        monad: {
          accountableVaults: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'
          ]
        }
      }
    },
  },
  "re7": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by Re7 Labs.',
      blockchains: {
        ethereum: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
          eulerVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
          mellow: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
          turtleclub: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
          symbiotic: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        base: {
          morphoVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        sonic: {
          eulerVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
          siloVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        bob: {
          eulerVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        berachain: {
          eulerVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        avax: {
          eulerVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        bsc: {
          eulerVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        wc: {
          morphoVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        polygon: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        unichain: {
          morphoVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        plume_mainnet: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        starknet: {
          vesu: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x3de03fafe6120a3d21dc77e101de62e165b2cdfe84d12540853bd962b970f99',
          ],
          vesuV2: [
            '0x0635cb8ba1c3b0b21cb2056f6b1ba75c3421ce505212aeb43ffd56b58343fa17', // Re7 ETH
            '0x0486294fe74daf3d964523e7a1f4e5d686f153934b2c183ececa0cab9dd2f3e6', // Re7 Labs Starknet Ecosystem
            '0x01fcdacc1d8184eca7b472b5acbaf1500cec9d5683ca95fede8128b46c8f9cc2', // Re7 STRK
            '0x03976cac265a12609934089004df458ea29c776d77da423c96dc761d09d24124', // Re7 USDC Core
            '0x02eef0c13b10b487ea5916b54c0a7f98ec43fb3048f60fdeedaf5b08f6f88aaf', // Re7 USDC Prime
            '0x073702fce24aba36da1eac539bd4bae62d4d6a76747b7cdd3e016da754d7a135', // Re7 Stable Core
            '0x03a8416bf20d036df5b1cf3447630a2e1cb04685f6b0c3a70ed7fb1473548ecf', // Re7 xBTC
          ],
        },
        tac: {
          eulerVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        linea: {
          eulerVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        plasma: {
          eulerVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
      }
    },
    _meta: {
      timetravel: false, // starknet doesn't support historical queries
      hallmarks: [
        ['2025-06-01', "Start tracking Vesu V1 vaults on Starknet"],
        ['2026-02-10', "Start tracking Vesu V2 vaults on Starknet"],
      ],
      hallmarks: [
        ['2025-06-01', "Start tracking Vesu V1 vaults on Starknet"],
        ['2026-02-10', "Start tracking Vesu V2 vaults on Starknet"],
      ],
    },
  },
  "relend": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by Relend Network.',
      blockchains: {
        ethereum: {
          morpho: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        base: {
          morpho: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        swellchain: {
          euler: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
      }
    },
  },
  "singularv": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by singularV.',
      blockchains: {
        ethereum: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
      }
    },
  },
  "sky-money": {
    config: {
      methodology: 'Count all assets deposited in all vaults curated by Sky Money.',
      blockchains: {
        ethereum: {
          morpho: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'
          ],

        },

      }
    },
  },
  "steakhouse": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by Steakhouse Financial.',
      blockchains: {
        ethereum: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // v2 USDC
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // v2 EURC
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // v2 USDT/ETH/AUSD
          ],
          morpho: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Steakhouse High Yield ETH
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // Steakhouse Prime EURC
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Steakhouse Prime frxUSD
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Steakhouse Prime Instant tGBP
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // Steakhouse Prime Instant tGBP
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Steakhouse Reservoir rUSD
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Steakhouse High Yield wstETH
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // Steakhouse Resolv USR
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Steakhouse tGBP
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Steakhouse High Yield ETH
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Steakhouse Prime frxUSD
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // AUSD High Yield Term
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Steakhouse High Yield
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // AUSD Turbo
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // cbBTC Turbo
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // ETH Turbo
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Techblock x Steakhouse EURCV
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Steakhouse High Yield
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // USDC High Yield Term
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // 3F Ecosystem Vault
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // Steakhouse Prime
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Steakhouse High Yield
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // USDC T-Prime Instant
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // USDC Turbo
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // XAUT Turbo
          ],
          mellow: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ]
        },
        base: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // v2 USDC
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // v2 EURC
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // v2 XSGD
          ],
          morpho: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // Riva x Steakhouse USDC
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Riva x Steakhouse EURC
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // Steakhouse High Yield USDC Edition
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // ETH Turbo
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // Steakhouse Morpho V2
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // Steakhouse Morpho V2
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Steakhouse Morpho V2
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // Steakhouse Morpho V2
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Steakhouse Morpho V2
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // Steakhouse Morpho V2
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // USDC Turbo
          ],
        },
        corn: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        unichain: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        arbitrum: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // v2 USDT0/USDC
          ],
          morpho: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // USDC Turbo
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE', // XAUT0 Turbo
          ],
        },
        katana: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        monad: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        polygon: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
          morpho: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Steakhouse Prime
          ],
        },
        solana: {
          kaminoLendVaultAdmins: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
      }
    },
  },
  "tanken-capital": {
    config: {
      methodology: 'Count all assets deposited in all vaults curated by Tanken Capital.',
      blockchains: {
        base: {
          erc4626: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Tanken Capital vault (IPOR Fusion, Morpho, Euler)
          ],
        },
        ethereum: {
          erc4626: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1', // Tanken USDC vault (Morpho Blue)
          ],
        },
      }
    },
  },
  "taulabs": {
    config: {
      methodology: 'Count all assets deposited in TAU Labs vaults.',
      blockchains: {
        ethereum: {
          erc4626: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'
          ],
        },
        flow: {
          erc4626: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ]
        },
        plasma: {
          erc4626: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ]
        },
        base: {
          erc4626: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE'
          ]
        }
      }
    },
  },
  "telosc": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by TelosC.',
      blockchains: {
        plasma: {
          eulerVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        ethereum: {
          eulerVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        }
      }
    },
  },
  "trinity-protocol": {
    config: {
      methodology: 'Tracks USDC in the Trinity Protocol MetaMorpho vault on Morpho Blue.',
      blockchains: {
        arbitrum: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
      },
    },
  },
  "tulip-capital": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by Tulip Capital.',
      blockchains: {
        ethereum: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
          eulerVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
          turtleclub: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
          erc4626: [
            "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1", // Lagoon: RockSolid rock.rETH
            "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1", // Lagoon: Flagship cbBTC
            "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE", // Lagoon: RockSolid Looped ETH Vault
            "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE", // Lagoon: Tulipa USDC
          ],
        },
        berachain: {
          eulerVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        bob: {
          eulerVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        bsc: {
          eulerVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        avax: {
          erc4626: [
            "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE", // Lagoon: Turtle Avalanche USDC
            "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1", // Lagoon: Turtle Avalanche BTC.b
          ],
        },
        tac: {
          erc4626: [
            "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE", // Lagoon: Noon USN TAC
          ],
        },
        monad: {
          erc4626: [
            "0x46531ea0E7cec64b14181d45F8C6798a1cE45da1", // Lagoon: MuDigital Tulipa USDC
            "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE", // Gearbox: Tulipa MON v3
          ]
        },
        base: {
          erc4626: [
            "0x3211d27a1A1B8E40C7974F6951935303e6e56DBE", // Creditcoop: Tulipa Credit Vault
          ]
        }
      }
    },
  },
  "unblock-equity": {
    config: {
      methodology:
        'Sum of totalAssets() across all UnblockEquity MetaMorpho V2 vaults on Base. Each vault accepts USDC deposits and lends against tokenized residential property liens (ERC-1155). Vaults are segmented by borrower verification level (Verified/Prime/Standard), recovery type (Lien-Only/Foreclosure), and escrow tier (None/BR3/BR6/BR12).',
      start: 1774396800, // 2026-03-25 UTC — Phase 06.1 deployment date
      blockchains: {
        base: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
      },
    },
  },
  "unified-labs": {
    config: {
      methodology: 'Count all assets deposited in vaults curated by Unified Labs.',
      blockchains: {
        monad: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
          morpho: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
      },
    },
  },
  "varlamore-capital": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by Varlamore Capital.',
      blockchains: {
        ethereum: {
          siloVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        arbitrum: {
          siloVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        sonic: {
          siloVaultOwners: [
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        avax: {
          siloVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ]
        }
      }
    },
    _meta: {
      hallmarks: [['2026-02-23', 'broken Stream finance vaults blacklisted']],
    },
  },
  "vault-bridge": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by Vault Bridge and its partners.',
      blockchains: {
        ethereum: {
          morpho: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
          erc4626: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
      }
    },
  },
  "birch-hill": {
    config: {
      blockchains: {
        base: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
      }
    },
  },
  "yearn-curating": {
    config: {
      methodology: 'Counts all assets that are deposited in all vaults curated by Yearn.',
      blockchains: {
        ethereum: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
          turtleclub_erc4626: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        base: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
        katana: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
          // ausd: [  // already counted as part of yearn
          //   '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'
          // ],
          // morphoSushi: [
          //   '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          //   '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          //   '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          //   '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          //   '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          // ],
        },
        arbitrum: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
          ],
        },
        hyperliquid: {
          morphoVaultOwners: [
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
            '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
          ],
        },
      }
    },
  },
}

const allProtocols = {}
for (const [name, { config, _meta }] of Object.entries(configs)) {
  allProtocols[name] = Object.assign(getCuratorExport(config), _meta || {})
}

module.exports = allProtocols
