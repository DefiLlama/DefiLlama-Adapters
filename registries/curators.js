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
            '0x23E6aecB76675462Ad8f2B31eC7C492060c2fAEF',
          ],
          morpho: [
            '0xb5e4576C2FAA16b0cC59D1A2f3366164844Ef9E0', // co-curator with tulip-capital
            '0x1E2aAaDcF528b9cC08F43d4fd7db488cE89F5741', // co-curator with tulip-capital
            '0x0bB2751a90fFF62e844b1521637DeD28F3f5046A', // co-curator with tulip-capital
          ],
          turtleclub: [
            '0xa853d8f5f253468495c5a92d54a3fe6cca2aa26b',
            '0x7388d4b5c4cfc96c9105de913717ba7519178129',
            '0xDe7CFf032D453Ce6B0a796043E75d380Df258812',
            '0xAF87B90E8a3035905697E07Bb813d2d59D2b0951',
          ],
        },
        base: {
          morphoVaultOwners: [
            '0x23E6aecB76675462Ad8f2B31eC7C492060c2fAEF',
          ],
        },
        unichain: {
          morphoVaultOwners: [
            '0x59e608E4842162480591032f3c8b0aE55C98d104',
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
            '0x1B35727072435BB97FBe8cC378eb6973c98FaAb3',
          ],
        },
        sonic: {
          siloVaultOwners: [
            '0x1B35727072435BB97FBe8cC378eb6973c98FaAb3',
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
            '0xEB4Af6fA3AFA08B10d593EC8fF87efB03BC04645',
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
            '0x0d8249DD621fB1c386A7A7A949504035Dd3436A3',
          ],
        },
        base: {
          eulerVaultOwners: [
            '0xf3ED34523E35279a1deB2960c0aC46Be8E23a2f4'
          ]
        },
        starknet: {
          vesu: [
            '0x7bafdbd2939cc3f3526c587cb0092c0d9a93b07b9ced517873f7f6bf6c65563',
            '0x27f2bb7fb0e232befc5aa865ee27ef82839d5fad3e6ec1de598d0fab438cb56',
            '0x5c678347b60b99b72f245399ba27900b5fc126af11f6637c04a193d508dda26',
            '0x2906e07881acceff9e4ae4d9dacbcd4239217e5114001844529176e1f0982ec',
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
            '0xa0E430870c4604CcfC7B38Ca7845B1FF653D0ff1',
            '0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca',
            '0x543257eF2161176D7C8cD90BA65C2d4CaEF5a796',
            '0xf24608E0CCb972b0b0f4A6446a0BBf58c701a026',
            '0xdbA76Bc542bb07538e046B40F2e8a215B409F7A8',
            '0x89BeDBB1C4837444Da215A377275Ff96A84D6f53',
            '0xbB2F06CeAE42CBcF5559Ed0713538c8892D977c9',
            '0x5083b1387Ec3d4Ee6467B83890D98f1AF93F7c48',
            '0x48a90E85be5C56b0A669985A12ee7C449fC79965',
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
            '0x3B8DfE237895f737271371F339eEcbd66Face43e',
            '0xf726311F85D45a7fECfFbC94bD8508a0A39958c6',
          ],
          eulerVaultOwners: [
            '0x3B8DfE237895f737271371F339eEcbd66Face43e',
            '0xf726311F85D45a7fECfFbC94bD8508a0A39958c6',
          ],
        },
        base: {
          morphoVaultOwners: [
            '0x3B8DfE237895f737271371F339eEcbd66Face43e',
            '0xf726311F85D45a7fECfFbC94bD8508a0A39958c6',
          ],
          eulerVaultOwners: [
            '0x3B8DfE237895f737271371F339eEcbd66Face43e',
            '0xf726311F85D45a7fECfFbC94bD8508a0A39958c6',
          ],
        },
        bsc: {
          eulerVaultOwners: [
            '0x3B8DfE237895f737271371F339eEcbd66Face43e',
            '0xf726311F85D45a7fECfFbC94bD8508a0A39958c6',
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
            '0x5dc53a23AdC9f2Bed98de6F59F7F309a7c71FF2B',
            '0xA2EAaD0D586cF9FD73bb2c09cF6A7E3e187D68cd',
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
            '0xb263237E30fe9be53d6F401FCC50dF125D60F01a',
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
            '0xf7D44D5a28d5AF27a7F9c8fc6eFe0129e554d7c4',
            '0x2566f66f68ed438726AD904524FB306A03FdB80B',
            // '0x17e7bB9fe7983947FdCf02c1E3d8e6C92C21da54', // Anthias is now curator for Moonwell's Morpho vaults
          ],
        },
        base: {
          morphoVaultOwners: [
            // '0x17e7bB9fe7983947FdCf02c1E3d8e6C92C21da54', // Anthias is now curator for Moonwell's Morpho vaults: https://x.com/MoonwellDeFi/status/1928491680031969510
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
            '0x9dF5A760820b0C8d6667eDDfc07641E0D0095616',
            '0xDF4C4A81e1b55F54E7f084e90b69817bA72821D6'
          ],
          nestedVaults: [
            '0xEBda86CB77E9e328d42bbba9B50E998d3534937D'
          ]
        },
        scroll: {
          erc4626: [
            '0xd39df22a3cd1C91B22d5E748Cc62b03eD3e8A8aD',
            '0xec5906675a92e4113a39d719c5c65a62a0995d59'
          ],
          nestedVaults: [
            '0x8a23d825467860edb4ACA0909f29D0a6A8e3a0a7',
          ]
        },
        arbitrum: {
          erc4626: [
            '0xa47c5203d22ae173788a9d9be0f2beecc97f4df9',
            '0xE3637cA4D1D6dD756dE0ecd527c40077029eCE6e',
            '0x75E9d4FEa6c408097eE4F3C63359D0dc617AcB4F',
            '0x567c1B5c2E58C66f84B80dff4C97b084B23B4E87',
            '0x9cE8A73296704d4689586347eF6e2087c2128F45'
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
            '0xBc79C4DA0452152D2C329ADE328C79705a964CEE'
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
            '0x0d1862e73a1430A5FD3245B47859c1BEcD6f3A1D',
            '0x2B11527e1fab84a5382D20efD198BF3d332f7E73',
            '0x65939777a9dC5A370707bb6b44b1ad0BC9e2D8a4',
            '0x34d16e4fB8757A88D986f9EfE2484F0badBF22C1',
            '0x0982eB22086183bF10acd2991A2dBeD1e3B9Ac2A',
            '0x76f31800eFdE39A5f98189447c7a514d974f4364',
            '0xd72c3a44b51C8D6631C004ecf3A318b9D2c58F80',
            '0x6945f516413cB2d7311297e8A39E7D004dEB5566',
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
            '0x30988479C2E6a03E7fB65138b94762D41a733458',
          ],
          eulerVaultOwners: [
            '0xb3CF59A5f12cA319861376C5e63Eef4790a42B44',
            '0x6539519E69343535a2aF6583D9BAE3AD74c6A293',
          ],
          erc4626: [
            '0x1166250D1d6B5a1DBb73526257f6bb2Bbe235295', // yoUSD IPOR Fusion
            '0xfd843a3D9329C91CA22c5daA994BeA762541F954', // yoETH IPOR Fusion
            '0x17d0f109EE895bAD0b68AA104AA72bd0b003AD8E', // ETH Lending Optimizer IPOR Fusion
            '0x5900C3b72458F12967DC1bef35b92d271F5cDBc1', // cbETH Looper IPOR Fusion
            '0xD46a3C2D958d0a2cB098d48C48dC19FE3A710F37', // USDC Lending Optimizer IPOR Fusion
            '0xc2dEC6328d9EF1eF2ee85901f9C1a8db8DD1C9C1', // wETH Metavault on Spectra
          ],
        },
        ethereum: {
          morphoVaultOwners: [
            '0x30988479C2E6a03E7fB65138b94762D41a733458',
            '0x829A13850b684A575C0580a83322890e19c5eFaa',
          ],
          erc4626: [
            '0xdd5eff0756db08bad0ff16b66f88f506e7318894', // YieldFi yPrism
            '0x87428d886F43068A44d7bDEeF106D3c42E1d6f23', // IPOR Fusion yoGOLD
          ],
          upshiftV2: [
            '0x18EE038C114a07f4B08b420fb1E4149a4F357249', // Upshift Wildcat USD
            '0xb2FdA773822E5a04c8A70348d66257DD5Cf442DB', // Upshift LiquityV2
          ],
        },
        polygon: {
          morphoVaultOwners: [
            '0x30988479C2E6a03E7fB65138b94762D41a733458',
          ],
        },
        unichain: {
          morphoVaultOwners: [
            '0x30988479C2E6a03E7fB65138b94762D41a733458',
          ],
        },
        katana: {
          morphoVaultOwners: [
            '0x30988479C2E6a03E7fB65138b94762D41a733458',
          ],
          erc4626: [
            '0xc2dEC6328d9EF1eF2ee85901f9C1a8db8DD1C9C1', // vbUSDC Metavault on Spectra
          ],
        },
        monad: {
          morphoVaultOwners: [
            '0x829A13850b684A575C0580a83322890e19c5eFaa',
          ],
          eulerVaultOwners: [
            '0x6539519E69343535a2aF6583D9BAE3AD74c6A293',
          ],
        },
        arbitrum: {
          morphoVaultOwners: [
            '0x30988479C2E6a03E7fB65138b94762D41a733458',
          ],
        },
        hemi: {
          morphoVaultOwners: [
            '0x30988479C2E6a03E7fB65138b94762D41a733458'
          ],
        },
        hyperliquid: {
          eulerVaultOwners: [
            '0x6539519E69343535a2aF6583D9BAE3AD74c6A293' // HypurrFi / Euler HyperEVM vaults
          ],
        },
        starknet: {
          vesuV2: [
            '0x1bc5de51365ed7fbb11ebc81cef9fd66b70050ec10fd898f0c4698765bf5803' // Clearstar USDC Reactor
          ],
        },
        flare: {
          morpho: [
            '0xE8dd6A1e13244A27bDaa19CcBf33013647C675d1', // Core USDT0 Vault on Mystic
            '0x1aEadA3C251215f1294720B80FcB3D1D005F3585', // Core wFLR Vault on Mystic
            '0x53184aDaBF312b490BF1EbcFdC896FEfF6019a14', // Core FXRP Vault on Mystic
          ],
          upshiftV2: [
            '0x373D7d201C8134D4a2f7b5c63560da217e3dEA28', // Upshift FXRP
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
          eulerVaultOwners: ["0xd7E606CB833fEdB224CA2360477C7519898d187B"],
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
            '0xB2b9a27a6160Bf9ffbD1a8d245f5de75541b1DDD',
            '0x1280e86Cd7787FfA55d37759C0342F8CD3c7594a',
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
            '0x9f3BEbF1159323f78E5c97Cc30f10907B71fCf8C', // Feather USDC vault
          ],
        },
        sei: {
          morpho: [
            '0x015F10a56e97e02437D294815D8e079e1903E41C',
            '0x8E181221D5602D4Cf2b87f3A817C0Dac680A7223',
            '0x94E6A8714f36cd7220560638882Fc137AB5eb79c',
            '0x948FcC6b7f68f4830Cd69dB1481a9e1A142A4923',
            '0xbD183661d2E8ceFA31799fE3A4cc6f2127963dc5',
            '0x50715ae180FF0EA799dc8AB635C2D876e528bfe8',
          ],
        },
        celo: {
          morphoVaultOwners: [
            '0x81c76F62f7E05DEC75800150bA5A23f62e2f091F',
          ],
        },
        klaytn: {
          morphoVaultOwners: [
            '0x6Ba8f7039bC7d79c1959cB8E409Dff2ba05A133E',
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
            '0xF92971B4D9e6257CF562400ed81d2986F28a8c26',
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
          morphoVaultOwners: ["0x42D510eDeb9257f8D920d5B9f5109D95cB22419d"],
        },
        base: {
          morphoVaultOwners: ["0x42D510eDeb9257f8D920d5B9f5109D95cB22419d"],
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
            "0xdae854d0896ad2fee335689a3f7b4a95fd1a3e46", // Lagoon - Gami USDC
            "0x33e1339567c183fbadcb43f72d11c47229d468ab", // Lagoon - Gami Stake DAO USDC
            "0x414070fb9e64fd69160d75da57e75ba11f9f605a", // Lagoon - Gami WBTC
            "0x57e6824a8b15b709cefb4ccef644ba1349057e77", // Lagoon - xBTCY (cbBTC)
            "0x2a676c2744421b4fae65ce86b47adacb620047d4", // Lagoon - Gami hemiBTC
            "0x2031eceec018549a2c729cacd6c0bfc4be2524ed", // Lagoon - Gami ETH (WETH)
            "0xfab0f56c28e3f874b15922b213e696f37b670916", // Lagoon - Coinshift USPC Prime
            "0x09252d2c4afca9b1479efdd39faa53de9ff23114", // Lagoon - Coinshift Leveraged USPC
            // Gearbox
            "0x683faf5bafd88d4c383ccaf3d61c26af2e164409", // Gearbox - Gami WBTC
          ],
        },
        base: {
          erc4626: [
            "0x776f95321a0285f8bcde149e3264d16dc08da69a", // Spectra - Gami Spectra USDC
          ],
        },
        flare: {
          erc4626: [
            "0x6420a613e936602ca3f1ad5680b3f4d47d473bf1", // Spectra - Flare XRP Yield Prime
          ],
        },
        hemi: {
          erc4626: [
            "0x1e32c96757c07775ca4fc796c4f4311722eaf35e", // Lagoon - Hemi USDC
          ],
        },
        avax: {
          erc4626: [
            "0xb3a2bcb30c1460d88db18b42a29fae2399952874", // Lagoon - USDC Avalanche Core
          ],
          silo: [
            "0x1F0570a081FeE0e4dF6eAC470f9d2D53CDEDa1c5", // Silo - Gami Silo USDC
            "0x0F78Ea587D8E2950319e0b467c665bD2CB73051B", // Silo - Gami Silo AVAX
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
            '0x76c303fA012109eCBb34E4bAf1789c3e9FbEb3A4',
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
            '0xc155444481854c60e7a29f4150373f479988f32d',
          ],
        },
        plasma: {
          erc4626: [
            '0x76309a9a56309104518847bba321c261b7b4a43f',
          ],
        },
        hemi: {
          erc4626: [
            '0x614eb485de3c6c49701b40806ac1b985ad6f0a2f', '0xD172B64AA13d892bb5EB35f3482058eAE0BC5B2a',
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
            '0x0B50beaE6aac0425e31d5a29080F2A7Dec22754a',
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
            '0x0FB44352bcfe4c5A53a64Dd0faD9a41184A1D609',
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
            '0x71807287926c5195D92D2872e73FC212C150C112',
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
            '0xf7e26Fa48A568b8b0038e104DfD8ABdf0f99074F', // Muscadine USDC Vault
            '0xAeCc8113a7bD0CFAF7000EA7A31afFD4691ff3E9', // Muscadine cbBTC Vault
            '0x21e0d366272798da3A977FEBA699FCB91959d120', // Muscadine WETH Vault
            // V2 Vaults
            '0x89712980cb434ef5ae4ab29349419eb976b0b496', // Muscadine USDC Prime
            '0xd6dcad2f7da91fbb27bda471540d9770c97a5a43', // Muscadine WETH Prime
            '0x99dcd0d75822ba398f13b2a8852b07c7e137ec70', // Muscadine cbBTC Prime
            '0x314fD07319ef645bA7D548915CCd91F4788A1839', // Muscadine USDC Frontier
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
            '0x517aBc7f49DFF75b57A88b9970eF35D6e4C3BD49',
          ],
          eulerVaultOwners: [
            '0x517aBc7f49DFF75b57A88b9970eF35D6e4C3BD49',
          ],
        },
      }
    },
  },
  "re7": {
    config: {
      methodology: 'Count all assets are deposited in all vaults curated by Re7 Labs.',
      blockchains: {
        ethereum: {
          morphoVaultOwners: [
            '0x46BA7bCD764a692208781B0Fdc642E272ee597bC',
            '0xE86399fE6d7007FdEcb08A2ee1434Ee677a04433',
          ],
          eulerVaultOwners: [
            '0xa563FEEA4028FADa193f1c1F454d446eEaa6cfD7',
            '0x46BA7bCD764a692208781B0Fdc642E272ee597bC',
          ],
          mellow: [
            '0x84631c0d0081FDe56DeB72F6DE77abBbF6A9f93a',
            '0x62F0BAf53959AF18Cab47082f5aB58A5B93e041C',
            '0x8b0e80716c4be087C271E964E0bDc7780d32A2E8',
            '0x2759E4741b370506BE2ccEf898960108e98f2faf',
            '0x4C690C311d8A5aa16eC2a595D4ea3928a73C48d6',
            '0x617895460004821C8DE800d4a644593cAb0aD40c',
            '0x3a828C183b3F382d030136C824844Ea30145b4c7',
            '0x7F43fDe12A40dE708d908Fb3b9BFB8540d9Ce444',
            '0xc65433845ecD16688eda196497FA9130d6C47Bd8',
            '0x7a4EffD87C2f3C55CA251080b1343b605f327E3a',
            '0x82f5104b23FF2FA54C2345F821dAc9369e9E0B26',
          ],
          turtleclub: [
            '0x294eecec65A0142e84AEdfD8eB2FBEA8c9a9fbad',
          ],
          symbiotic: [
            '0x35E44d92E8F738A272Bddbae53d1Dc9490e75Fe7',
          ],
        },
        base: {
          morphoVaultOwners: [
            '0xD8B0F4e54a8dac04E0A57392f5A630cEdb99C940',
          ],
        },
        sonic: {
          eulerVaultOwners: [
            '0xF602d3816bC63fC5f5Dc87bB56c537D0d0078532',
            '0x46BA7bCD764a692208781B0Fdc642E272ee597bC',
          ],
          siloVaultOwners: [
            '0x3BA1566ED39F865bAf4c1Eb9acE53F3D2062bE65',
          ],
        },
        bob: {
          eulerVaultOwners: [
            '0x46BA7bCD764a692208781B0Fdc642E272ee597bC',
          ],
        },
        berachain: {
          eulerVaultOwners: [
            '0x46BA7bCD764a692208781B0Fdc642E272ee597bC',
          ],
        },
        avax: {
          eulerVaultOwners: [
            '0x7B41b9891887820A75A51a1025dB1A54f4798521',
            '0x3BA1566ED39F865bAf4c1Eb9acE53F3D2062bE65',
          ],
        },
        bsc: {
          eulerVaultOwners: [
            '0x187620a61f4f00Cb629b38e1b38BEe8Ea60d2B8D',
          ],
        },
        wc: {
          morphoVaultOwners: [
            '0x46BA7bCD764a692208781B0Fdc642E272ee597bC',
            '0x598A41fA4826e673829D4c5AfD982C0a43977ca6',
          ],
        },
        polygon: {
          morphoVaultOwners: [
            '0x7B41b9891887820A75A51a1025dB1A54f4798521',
          ],
        },
        unichain: {
          morphoVaultOwners: [
            '0x187620a61f4f00Cb629b38e1b38BEe8Ea60d2B8D',
          ],
        },
        plume_mainnet: {
          morphoVaultOwners: [
            '0x7B41b9891887820A75A51a1025dB1A54f4798521',
            '0x06590Fef209Ebc1f8eEF83dA05984cD4eFf0d0E3',
          ],
        },
        starknet: {
          vesu: [
            '0x7f135b4df21183991e9ff88380c2686dd8634fd4b09bb2b5b14415ac006fe1d',
            '0x52fb52363939c3aa848f8f4ac28f0a51379f8d1b971d8444de25fbd77d8f161',
            '0x2e06b705191dbe90a3fbaad18bb005587548048b725116bff3104ca501673c1',
            '0x6febb313566c48e30614ddab092856a9ab35b80f359868ca69b2649ca5d148d',
            '0x59ae5a41c9ae05eae8d136ad3d7dc48e5a0947c10942b00091aeb7f42efabb7',
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
            '0xE5EAE3770750dC9E9eA5FB1B1d81A0f9C6c3369c',
          ],
        },
        linea: {
          eulerVaultOwners: [
            '0xE5EAE3770750dC9E9eA5FB1B1d81A0f9C6c3369c',
          ],
        },
        plasma: {
          eulerVaultOwners: [
            '0xE5EAE3770750dC9E9eA5FB1B1d81A0f9C6c3369c',
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
            '0x0F359FD18BDa75e9c49bC027E7da59a4b01BF32a',
            '0xB9C9158aB81f90996cAD891fFbAdfBaad733c8C6',
          ],
        },
        base: {
          morpho: [
            '0x70F796946eD919E4Bc6cD506F8dACC45E4539771',
          ],
        },
        swellchain: {
          euler: [
            '0xc5976e0356f0A3Ce8307fF08C88bB05933F88761',
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
            '0x46057881E0B9d190920FB823F840B837f65745d5',
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
            '0x23f5E9c35820f4baB695Ac1F19c203cC3f8e1e11',
            '0xE15fcC81118895b67b6647BBd393182dF44E11E0',
            '0x56bfa6f53669B836D1E0Dfa5e99706b12c373ecf',
            '0xf42bca228D9bd3e2F8EE65Fec3d21De1063882d4',
            '0x2bD3A43863c07B6A01581FADa0E1614ca5DF0E3d'
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
            '0x0000aeB716a0DF7A9A1AAd119b772644Bc089dA8',
            '0x255c7705e8BB334DfCae438197f7C4297988085a',
            '0x0A0e559bc3b0950a7e448F0d4894db195b9cf8DD',
            '0xc01Ba42d4Bd241892B813FA8bD4589EAA4C60672',
            '0xd3e5c0FEB60563dc70ab08B9a7Fdf27B8d04b30b',
            '0x4D7bd498Bb24098Ca281C05519629c605407f71d',
            '0x7E17eC774beCd5f4f129fA5F150046dD0ECe5BB0', // v2 USDC
            '0x328Dc4A2950b4A19fd440e9ffc6e9c3A496AFCFd', // v2 EURC
            '0xec0Caa2CbAe100CEAaC91A665157377603a6B766', // v2 USDT/ETH/AUSD
          ],
          morpho: [
            '0x6cbF3Eed95976D226FFB0bEb09550A9407f47b60', // Steakhouse High Yield ETH
            '0xbeef003E31546C7210687f1A7b40d096BE83ec58', // Steakhouse Prime EURC
            '0xbeef009FF4FB1727297BF2526806F4A73E4b99aD', // Steakhouse Prime frxUSD
            '0xbeef06Fc20699603b995bab8AB03a0592BB4C12f', // Steakhouse Prime Instant tGBP
            '0xbeef0c68466183937a22e1F414E8789a45032302', // Steakhouse Prime Instant tGBP
            '0xBEeFf08E1887A11D91B9Ca68c133c08Ae3c4B44f', // Steakhouse Reservoir rUSD
            '0xbeeff8d3F412A586A204085Cf777867d06763b40', // Steakhouse High Yield wstETH
            '0xbeeff9eBE518d1C7E552c4BbfB99487435c4dEc9', // Steakhouse Resolv USR
            '0xbeeffABcd0dB09589Dd21854aa760C52aB4bf04F', // Steakhouse tGBP
            '0xbeEFfc7b7d0604b4afB92628a8E4B09dc01d008A', // Steakhouse High Yield ETH
            '0xF03C521F3F1D122ffFEF451936D483EAB95BE17c', // Steakhouse Prime frxUSD
            '0xBEEFF0DeaC1aBa71EF0D88C4291354eb92ef4589', // AUSD High Yield Term
            '0xBEEfF0d672ab7F5018dFB614c93981045D4aA98a', // Steakhouse High Yield
            '0xBEEFFF7e4EedD83A4a4aB53A68D03eC77C9a57a8', // AUSD Turbo
            '0xBEEFFF506B52B3323c48aFE0Cb405A284F0f9cF2', // cbBTC Turbo
            '0xBEEFFFcbA46C49A24cfBfFc19166e8f089B59300', // ETH Turbo
            '0xBEeF007ECFBfdF9B919d0050821A9B6DbD634fF0', // Techblock x Steakhouse EURCV
            '0xd8A6511979D9C5D387c819E9F8ED9F3a5C6c5379', // Steakhouse High Yield
            '0xBEEFFFC57A26fD8D3b693Ba025ead597DbECEBfe', // USDC High Yield Term
            '0xBEEf3f3A04e28895f3D5163d910474901981183D', // 3F Ecosystem Vault
            '0xBeefF08dF54897e7544aB01d0e86f013DA354111', // Steakhouse Prime
            '0xBEeFF047C03714965a54b671A37C18beF6b96210', // Steakhouse High Yield
            '0x6f48cE6380693808682E43140E3Eeb877a096Aa1', // USDC T-Prime Instant
            '0xBEEFFF4716a49418D69c251cab8759bB107e57C8', // USDC Turbo
            '0xBEEFFFDE1CABD3d8A3cd4fd5e04DbA51B9D4Ac39', // XAUT Turbo
          ],
          mellow: [
            '0xBEEF69Ac7870777598A04B2bd4771c71212E6aBc',
            '0x9707f14B6c8200CBf6c6F2c5498D1D0019A5f15A',
            '0x4C797D53f4772325A8aDFd509F13A2d60Daa7d02',
            '0x5E362eb2c0706Bd1d134689eC75176018385430B',
          ]
        },
        base: {
          morphoVaultOwners: [
            '0x0A0e559bc3b0950a7e448F0d4894db195b9cf8DD',
            '0x0000aeB716a0DF7A9A1AAd119b772644Bc089dA8',
            '0x639bfA26472906Ccd40513408284a8aD292bC5D6',
            '0x351D76EC45f0aD6Deb498806F1320F75F861a114', // v2 USDC
            '0x8A7cDA8322FB96d3457A5b32C8869A7B1A5b1DB7', // v2 EURC
            '0x769699C75c4E17ebd5D678A9c58776179DDC254B', // v2 XSGD
          ],
          morpho: [
            '0xbEeF006fb43820C864894892db0eCFEee3FdF587', // Riva x Steakhouse USDC
            '0xbeEf00890534C736186f3126187Da80c961EdCa1', // Riva x Steakhouse EURC
            '0xbeeff2490FEffa212faC2f6553682C219E6a8845', // Steakhouse High Yield USDC Edition
            '0xBEEFFFdeADc2c172130Ac4C5Ae48c8D4708BFb40', // ETH Turbo
            '0xBeEFDebfaea8350Ce8C4b3a6B7E5FE629c9e27A8', // Steakhouse Morpho V2
            '0xbeEf003c7df2AB8dEF9Fbfc4B233CC13f83D1dA5', // Steakhouse Morpho V2
            '0xBeEF00fc6e87dE086A0e29169A2f6e25cF5C11a9', // Steakhouse Morpho V2
            '0xbeef00b4ebc8094A60006D75B277d30480e0a6D8', // Steakhouse Morpho V2
            '0xBeEF00283d2b26a55F56B9f8c283b25e9a22E95b', // Steakhouse Morpho V2
            '0xBEEff02DE231f8B08c627C769edC73e7AcE47264', // Steakhouse Morpho V2
            '0xBEEFFFe68dFc2D3BD1ABdAd37c70634973b16478', // USDC Turbo
          ],
        },
        corn: {
          morphoVaultOwners: [
            '0x84ae7f8eb667b391a5ae2f69bd5a0e4b5b77c999',
          ],
        },
        unichain: {
          morphoVaultOwners: [
            '0x0A0e559bc3b0950a7e448F0d4894db195b9cf8DD',
          ],
        },
        arbitrum: {
          morphoVaultOwners: [
            '0x0000aeB716a0DF7A9A1AAd119b772644Bc089dA8',
            '0x0A0e559bc3b0950a7e448F0d4894db195b9cf8DD',
            '0xca9f621aAFD28d0F2decFb69Db0d9e6393A9f5ee',
            '0x0b1aA22117E38f260e0F3aB3b0F12a22c2691ffC', // v2 USDT0/USDC
          ],
          morpho: [
            '0xBEEFFF13dD098De415e07F033daE65205B31A894', // USDC Turbo
            '0xBEEFFFFE0E9b26bBe3B5cE851539366991C3BF39', // XAUT0 Turbo
          ],
        },
        katana: {
          morphoVaultOwners: [
            '0x0A0e559bc3b0950a7e448F0d4894db195b9cf8DD',
            '0xe6FC2a011153DD5a230725a9F0c89a9c81aB4887',
          ],
        },
        monad: {
          morphoVaultOwners: [
            '0x0000aeB716a0DF7A9A1AAd119b772644Bc089dA8',
            '0xd546dc0db55c28860176147b2d0fefcc533ecf08',
            '0x2b1D7d0CE2816C83c9bABe48b2FB545488139DCD',
            '0x706931c18022d7Af5a76350545B93aBFB54B62FC',
          ],
        },
        polygon: {
          morphoVaultOwners: [
            '0x0A0e559bc3b0950a7e448F0d4894db195b9cf8DD',
            '0x0000aeB716a0DF7A9A1AAd119b772644Bc089dA8',
          ],
          morpho: [
            '0xBEEf0F82E269760429BE6255Fa00821b7e4b592A', // Steakhouse Prime
          ],
        },
        solana: {
          kaminoLendVaultAdmins: [
            '9ceRgz579BcfWogs3RE11FKNQaWW7Lmtnev3MXspxUjF',
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
            '0xebc6c7883ca32ef9484740ba32a816f5f88b7a41', // Tanken Capital vault (IPOR Fusion, Morpho, Euler)
          ],
        },
        ethereum: {
          erc4626: [
            '0xca7c196f00e04A5e1c71B91476d0d58f82499734', // Tanken USDC vault (Morpho Blue)
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
            '0xb0f56bb0bf13ee05fef8cd2d8df5ffdfcac7a74f',
            '0x6f66b845604dad6e80b2a1472e6cacbbe66a8c40',
            '0x43a32d4f6c582f281c52393f8f9e5ace1d4a1e68',
            '0xe48cdd5ecec5aa53e630a7b4df12f79067b68dac',
            '0x63103375659d0aa94e9f35df15be01a3dd1ae9c0',
            '0xc50b2d51fd1e2ac67a9c09eaf63c24ea2465c64b',
            '0xc2a119ea6de75e4b1451330321cb2474eb8d82d4',
            '0x60e36a79c3d21120350e39b5ea59ae26b75ae74c',
            '0xd36f53497507e948df9f277cf8c3ececb09a1c1d',
            '0x604117f0c94561231060f56cd2ddd16245d434c5',
            '0xad685fec2066d7f5436f5804882998ba79725706',
            '0xdf8a0d3c90462c4c9b5a8697c119fa67cb84a874',
            '0x5fe86b1adee4b18f6a8c55ea0bdbb55e2e445159'
          ],
        },
        flow: {
          erc4626: [
            '0xc52E820d2D6207D18667a97e2c6Ac22eB26E803c',
          ]
        },
        plasma: {
          erc4626: [
            '0x0a71624ab3e8101f78d95dfc81e0f1f31128ed7a',
          ]
        },
        base: {
          erc4626: [
            '0x01a6ff6eb333c1393ef424f5894b18367f1499a8',
            '0xe883426b4fc84a7f5cc86415cabbef43e73a4cc8'
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
            '0x7054b25D47b9342dA3517AD41A4BD083De8D3f70',
            '0x7d07BFdd01422D7b655B333157eB551B9712dCd8',
          ],
        },
        ethereum: {
          eulerVaultOwners: [
            '0x7054b25D47b9342dA3517AD41A4BD083De8D3f70',
            '0x7d07BFdd01422D7b655B333157eB551B9712dCd8',
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
            '0xA3336Bb25F231Fa25E66D2DDA3a9Aa0ed8be09DB',
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
            '0x59e608E4842162480591032f3c8b0aE55C98d104',
          ],
          eulerVaultOwners: [
            '0x7c615e12D1163fc0DdDAA01B51922587034F5C93',
          ],
          turtleclub: [
            '0x6Bf340dB729d82af1F6443A0Ea0d79647b1c3DDf',
            '0x7895a046b26cc07272b022a0c9bafc046e6f6396',
            '0x686c83Aa81ba206354fDcbc2cd282B4531365E29',
          ],
          erc4626: [
            "0x936facdf10c8c36294e7b9d28345255539d81bc7", // Lagoon: RockSolid rock.rETH
            "0xb09f761cb13baca8ec087ac476647361b6314f98", // Lagoon: Flagship cbBTC
            "0x7a12D4B719F5aA479eCD60dEfED909fb2A37e428", // Lagoon: RockSolid Looped ETH Vault
            "0xce0b790ae0d8cf91e01f3fb69025e14569b574f3", // Lagoon: Tulipa USDC
          ],
        },
        berachain: {
          eulerVaultOwners: [
            '0x18d23B961b11079EcD499c0EAD8E4F347e4d3A66',
          ],
        },
        bob: {
          eulerVaultOwners: [
            '0x7c615e12D1163fc0DdDAA01B51922587034F5C93',
          ],
        },
        bsc: {
          eulerVaultOwners: [
            '0x7c615e12D1163fc0DdDAA01B51922587034F5C93',
          ],
        },
        avax: {
          erc4626: [
            "0x3048925b3ea5a8c12eecccb8810f5f7544db54af", // Lagoon: Turtle Avalanche USDC
            "0xb893c8d7000e0408eb7d168152ec7fefdd0d25e3", // Lagoon: Turtle Avalanche BTC.b
          ],
        },
        tac: {
          erc4626: [
            "0x279385c180f5d01c4a4bdff040f17b8957304762", // Lagoon: Noon USN TAC
          ],
        },
        monad: {
          erc4626: [
            "0x0da39b740834090C146dC48357f6A435a1Bb33b3", // Lagoon: MuDigital Tulipa USDC
            "0x09ca6b76276ec0682adb896418b99cb7e44a58a0", // Gearbox: Tulipa MON v3
          ]
        },
        base: {
          erc4626: [
            "0x61a8606e04d350dfa1d1aaa68b37260746ae47d4", // Creditcoop: Tulipa Credit Vault
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
            '0x6D9DA17560d584bB03255905ab42C2F4d67eA9B4',
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
            '0x75B3C335B85C931B1eE7BEeB3c0e40429F002373',
          ],
          morpho: [
            '0x35E4f3111B37135B1A8EBd72d8cBC9624AeE863a',
            '0x0ED3615ff949C8A34D15441970900E849A3409FC',
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
            '0xd8454B3787c6Aab1cf2846AF7882f8c440C3903d',
          ],
        },
        arbitrum: {
          siloVaultOwners: [
            '0xd8454B3787c6Aab1cf2846AF7882f8c440C3903d',
          ],
        },
        sonic: {
          siloVaultOwners: [
            '0xd8454B3787c6Aab1cf2846AF7882f8c440C3903d',
          ],
        },
        avax: {
          siloVaultOwners: [
            '0xd8454B3787c6Aab1cf2846AF7882f8c440C3903d',
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
            '0xBEefb9f61CC44895d8AEc381373555a64191A9c4',
            '0xc54b4E08C1Dcc199fdd35c6b5Ab589ffD3428a8d',
            '0x31A5684983EeE865d943A696AAC155363bA024f9',
            '0x812B2C6Ab3f4471c0E43D4BB61098a9211017427',
          ],
          erc4626: [
            '0x3DD459dE96F9C28e3a343b831cbDC2B93c8C4855',
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
            '0xbCC5C59E64B0Ff3a3Ee5eAb74BE7c787A0a438F1',
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
            '0xFc5F89d29CCaa86e5410a7ad9D9d280d4455C12B',
            '0x50B75d586929Ab2F75dC15f07E1B921b7C4Ba8fA',
            '0x75a1253432356f90611546a487b5350CEF08780D',
          ],
          turtleclub_erc4626: [
            '0xF470EB50B4a60c9b069F7Fd6032532B8F5cC014d',
            '0xA5DaB32DbE68E6fa784e1e50e4f620a0477D3896',
            '0xe1Ac97e2616Ad80f69f705ff007A4bbb3655544a',
            '0x77570CfEcf83bc6bB08E2cD9e8537aeA9F97eA2F',
          ],
        },
        base: {
          morphoVaultOwners: [
            '0xFc5F89d29CCaa86e5410a7ad9D9d280d4455C12B',
            '0x50b75d586929ab2f75dc15f07e1b921b7c4ba8fa',
            '0x75a1253432356f90611546a487b5350CEF08780D',
          ],
        },
        katana: {
          morphoVaultOwners: [
            '0xFc5F89d29CCaa86e5410a7ad9D9d280d4455C12B',
            '0x518C21DC88D9780c0A1Be566433c571461A70149',
            '0x50b75d586929ab2f75dc15f07e1b921b7c4ba8fa',
            '0x75a1253432356f90611546a487b5350CEF08780D',
          ],
          // ausd: [  // already counted as part of yearn
          //   '0x93Fec6639717b6215A48E5a72a162C50DCC40d68'
          // ],
          // morphoSushi: [
          //   '0x9A6bd7B6Fd5C4F87eb66356441502fc7dCdd185B',
          //   '0x8Fb1c10Ad4417EcA341a1D903Ff437d25ff87a4e',
          //   '0xAa0362eCC584B985056E47812931270b99C91f9d',
          //   '0x80c34BD3A3569E126e7055831036aa7b212cB159',
          //   '0xE007CA01894c863d7898045ed5A3B4Abf0b18f37',
          // ],
        },
        arbitrum: {
          morphoVaultOwners: [
            '0xFc5F89d29CCaa86e5410a7ad9D9d280d4455C12B',
            '0x50b75d586929ab2f75dc15f07e1b921b7c4ba8fa',
            '0x75a1253432356f90611546a487b5350CEF08780D',
          ],
        },
        hyperliquid: {
          morphoVaultOwners: [
            '0xFc5F89d29CCaa86e5410a7ad9D9d280d4455C12B',
            '0x50b75d586929ab2f75dc15f07e1b921b7c4ba8fa',
            '0x75a1253432356f90611546a487b5350CEF08780D',
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
