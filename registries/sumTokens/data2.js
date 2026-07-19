const ADDRESSES = require('../../projects/helper/coreAssets.json')

// Additional sumTokens registry configs, split out of registries/sumTokens.js / data1.js to keep files manageable.
// Same config shape as the `configs` object in sumTokens.js.
module.exports = {
  "interport-finance": {
    "methodology": "Interport TVL is calculated by summing the USDT and USDC balance of the vaults contracts, ITP token balance in the ITP Revenue Share contract and LP token balance in the LP Revenue Share contract.",
    "ethereum": {
      "tvl": { "tokensAndOwners": [["0xdAC17F958D2ee523a2206206994597C13D831ec7","0xEc8DDCb498b44C35EFaD7e5e43E0Caf6D16A66E8"],["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48","0x5b45B414c6CD2a3341bE70Ba22BE786b0124003F"]] },
      "staking": { "__staking": ["0x5DC6796Adc2420BD0f48e05f70f34B30F2AaD313", "0x2b1D36f5B61AdDAf7DA7ebbd11B35FD8cfb0DE31"] },
      "pool2": { "__staking": ["0x646De66c9A08abF0976869DE259E4B12D06F66ac", "0x4db2C7dd361379134140ffb9D85248e8498008E4"] }
    },
    "avax": {
      "tvl": { "tokensAndOwners": [["0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7","0xEc8DDCb498b44C35EFaD7e5e43E0Caf6D16A66E8"],["0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E","0x5b45B414c6CD2a3341bE70Ba22BE786b0124003F"]] }
    },
    "bsc": {
      "tvl": { "tokensAndOwners": [["0x55d398326f99059fF775485246999027B3197955","0xEc8DDCb498b44C35EFaD7e5e43E0Caf6D16A66E8"],["0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d","0x5b45B414c6CD2a3341bE70Ba22BE786b0124003F"]] }
    },
    "fantom": {
      "tvl": { "tokensAndOwners": [["0xcc1b99dDAc1a33c201a742A1851662E87BC7f22C","0xd0Adc0cdE959616666c4691985df91C60ca3C0F7"],["0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf","0xb6AB8EeFAE1a2c22Ca6338E143cb7dE544800c6e"]] }
    },
    "arbitrum": {
      "tvl": { "tokensAndOwners": [["0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9","0xEc8DDCb498b44C35EFaD7e5e43E0Caf6D16A66E8"],["0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8","0x5b45B414c6CD2a3341bE70Ba22BE786b0124003F"]] }
    },
    "polygon": {
      "tvl": { "tokensAndOwners": [["0xc2132D05D31c914a87C6611C10748AEb04B58e8F","0xEc8DDCb498b44C35EFaD7e5e43E0Caf6D16A66E8"],["0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174","0x5b45B414c6CD2a3341bE70Ba22BE786b0124003F"]] }
    },
    "polygon_zkevm": {
      "tvl": { "tokensAndOwners": [["0x1E4a5963aBFD975d8c9021ce480b42188849D41d","0xEc8DDCb498b44C35EFaD7e5e43E0Caf6D16A66E8"],["0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035","0x5b45B414c6CD2a3341bE70Ba22BE786b0124003F"]] }
    },
    "base": {
      "tvl": { "tokensAndOwners": [["0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA","0x5b45B414c6CD2a3341bE70Ba22BE786b0124003F"]] }
    },
    "era": {
      "tvl": { "tokensAndOwners": [["0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4","0xc724832c5ed81599aE3E4EBC0eC4f87A285B5838"]] }
    },
    "optimism": {
      "tvl": { "tokensAndOwners": [["0x94b008aA00579c1307B0EF2c499aD98a8ce58e58","0xEc8DDCb498b44C35EFaD7e5e43E0Caf6D16A66E8"],["0x7F5c764cBc14f9669B88837ca1490cCa17c31607","0x5b45B414c6CD2a3341bE70Ba22BE786b0124003F"]] }
    },
    "linea": {
      "tvl": { "tokensAndOwners": [["0xA219439258ca9da29E9Cc4cE5596924745e12B93","0xEc8DDCb498b44C35EFaD7e5e43E0Caf6D16A66E8"],["0x176211869cA2b568f2A7D4EE941E073a821EE1ff","0x5b45B414c6CD2a3341bE70Ba22BE786b0124003F"]] }
    },
    "op_bnb": {
      "tvl": { "tokensAndOwners": [["0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3","0xEc8DDCb498b44C35EFaD7e5e43E0Caf6D16A66E8"]] }
    },
    "scroll": {
      "tvl": { "tokensAndOwners": [["0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df","0xEc8DDCb498b44C35EFaD7e5e43E0Caf6D16A66E8"],["0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4","0x5b45B414c6CD2a3341bE70Ba22BE786b0124003F"]] }
    },
    "manta": {
      "tvl": { "tokensAndOwners": [["0xf417F5A458eC102B90352F697D6e2Ac3A3d2851f","0xEc8DDCb498b44C35EFaD7e5e43E0Caf6D16A66E8"],["0xb73603C5d87fA094B7314C74ACE2e64D165016fb","0x5b45B414c6CD2a3341bE70Ba22BE786b0124003F"]] }
    },
    "blast": {
      "tvl": { "tokensAndOwners": [["0x4300000000000000000000000000000000000003","0x5b45B414c6CD2a3341bE70Ba22BE786b0124003F"]] }
    },
    "zklink": {
      "tvl": { "tokensAndOwners": [["0x2F8A25ac62179B31D62D7F80884AE57464699059","0xd9eF111006F7477aC6E70dD2B782D8A901f6Ff5b"],["0x1a1A3b2ff016332e866787B311fcB63928464509","0x22E7c5d443400eef48F58acdEC67986373cf6c74"]] }
    },
  },
  "tonbridge": {
    "hallmarks": [["2022-05-07", "UST depeg"]],
    "everscale": { "tvl": { "__empty": true } },
    "avax": {
      "tvl": {
        "owner": "0x54c55369a6900731d22eacb0df7c0253cf19dfff",
        "tokens": [ADDRESSES.avax.DAI, ADDRESSES.avax.USDT_e, ADDRESSES.avax.USDC, ADDRESSES.avax.WBTC_e, ADDRESSES.avax.WETH_e]
      }
    },
    "bsc": {
      "tvl": {
        "owner": "0x54c55369a6900731d22eacb0df7c0253cf19dfff",
        "tokens": [ADDRESSES.bsc.DAI, ADDRESSES.bsc.USDC, ADDRESSES.bsc.USDT, ADDRESSES.bsc.BTCB, ADDRESSES.bsc.ETH]
      }
    },
    "ethereum": {
      "tvl": {
        "owner": "0x54c55369a6900731d22eacb0df7c0253cf19dfff",
        "tokens": [ADDRESSES.ethereum.DAI, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.WBTC, ADDRESSES.ethereum.WETH, ADDRESSES.ethereum.FRAX, ADDRESSES.ethereum.FXS]
      }
    },
    "fantom": {
      "tvl": {
        "owner": "0x54c55369a6900731d22eacb0df7c0253cf19dfff",
        "tokens": ["0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e", "0x04068da6c83afcfa0e13ba15a6696662335d5b75", ADDRESSES.fantom.WBTC]
      }
    },
    "polygon": {
      "tvl": {
        "owner": "0x54c55369a6900731d22eacb0df7c0253cf19dfff",
        "tokens": [ADDRESSES.polygon.DAI, ADDRESSES.polygon.USDC, ADDRESSES.polygon.USDT, ADDRESSES.polygon.WBTC, ADDRESSES.polygon.WETH_1]
      }
    }
  },
  "chainge": {
    "methodology": "assets in liquidity are counted as TVL + balances of all tokens (USDC, USDT, WBTC, WETH, WSYS, and native SYS) held in the Chainge treasury address on the Rollux network. These tokens are used to provide liquidity for cross-chain swaps.",
    "fusion": { "tvl": { "__empty": true } },
    "rollux": {
      "tvl": {
        "owner": "0x66ff2f0AC3214758D1e61B16b41e3d5e62CAEcF1",
        "tokens": [ADDRESSES.rollux.USDC, ADDRESSES.rollux.USDT, ADDRESSES.rollux.WBTC, ADDRESSES.rollux.WETH, ADDRESSES.rollux.WSYS, ADDRESSES.null]
      }
    }
  },
  "haystack": {
    "timetravel": false,
    "methodology": "Counts the total HAY tokens held in the Haystack staking escrow account on Algorand.",
    "algorand": {
      "tvl": { "__empty": true },
      "staking": {
        "owner": "OLSICPA5V6IPWORUVWQKCJTSFKLP7P5JORZBICKU6CH7W7EVMDALLWD7SQ",
        "tokens": ["3160000000"]
      }
    }
  },
  "y24": {
    "methodology": "This is the total value locked in y24 staking",
    "bsc": {
      "tvl": { "__empty": true },
      "staking": {
        "__resolveUnknownTokenLP": true,
        "owners": ["0x8aCE17bAadBbAfb8178330d4C87C224a08826520", "0xe0Ceee33e1CE1EF4EA322B50D55d99E714B7BB6d"],
        "tokens": ["0x652000ba3c230d83279AEC84A49d41d706AFB0F1"],
        "lps": ["0x44628669C0F888b2884d20b94C22af465AA11f05"],
        "useDefaultCoreAssets": true
      }
    }
  },
  "woofi": {
    "fantom": {
      "tvl": { "owner": "0x286ab107c5E9083dBed35A2B5fb0242538F4f9bf", "tokens": [ADDRESSES.fantom.WFTM, "0x74b23882a30290451A17c44f4F05243b6b58C76d", ADDRESSES.fantom.WBTC, "0x6626c47c00F1D87902fc13EECfaC3ed06D5E8D8a", "0x04068da6c83afcfa0e13ba15a6696662335d5b75", "0x049d68029688eabf473097a2fc38ef61633a3c7a"] },
      "staking": { "owners": ["0x2Fe5E5D341cFFa606a5d9DA1B6B646a381B0f7ec", "0x1416E1378682b5Ca53F76656549f7570ad0703d9"], "tokens": ["0x6626c47c00f1d87902fc13eecfac3ed06d5e8d8a"] }
    },
    "bsc": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.bsc.WBNB, ADDRESSES.bsc.ETH, ADDRESSES.bsc.BTCB, "0x4691937a7508860F876c9c0a2a617E7d9E945D4B", ADDRESSES.bsc.USDT, ADDRESSES.bsc.BUSD, "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82"] },
      "staking": { "owners": ["0x2AEab1a338bCB1758f71BD5aF40637cEE2085076", "0xba91ffD8a2B9F68231eCA6aF51623B3433A89b13"], "tokens": ["0x4691937a7508860f876c9c0a2a617e7d9e945d4b"] }
    },
    "avax": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.avax.WAVAX, ADDRESSES.avax.WETH_e, ADDRESSES.avax.BTC_b, "0xaBC9547B534519fF73921b1FBA6E672b5f58D083", ADDRESSES.avax.USDC, ADDRESSES.avax.USDt] },
      "staking": { "owners": ["0xcd1B9810872aeC66d450c761E93638FB9FE09DB0", "0x3Bd96847C40De8b0F20dA32568BD15462C1386E3"], "tokens": ["0xabc9547b534519ff73921b1fba6e672b5f58d083"] }
    },
    "polygon": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.polygon.WMATIC_2, ADDRESSES.polygon.WETH_1, ADDRESSES.polygon.WBTC, "0x1B815d120B3eF02039Ee11dC2d33DE7aA4a8C603", ADDRESSES.polygon.USDC, ADDRESSES.polygon.USDC_CIRCLE, ADDRESSES.polygon.USDT] },
      "staking": { "owners": ["0x9BCf8b0B62F220f3900e2dc42dEB85C3f79b405B", "0xba91ffD8a2B9F68231eCA6aF51623B3433A89b13"], "tokens": ["0x1b815d120b3ef02039ee11dc2d33de7aa4a8c603"] }
    },
    "arbitrum": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.arbitrum.WETH, ADDRESSES.arbitrum.WBTC, "0xcAFcD85D8ca7Ad1e1C6F82F651fA15E33AEfD07b", ADDRESSES.arbitrum.ARB, ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.USDT] },
      "staking": { "owners": ["0x9321785D257b3f0eF7Ff75436a87141C683DC99d", "0x2CFa72E7f58dc82B990529450Ffa83791db7d8e2"], "tokens": ["0xcafcd85d8ca7ad1e1c6f82f651fa15e33aefd07b"] }
    },
    "optimism": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.optimism.WETH_1, ADDRESSES.optimism.WBTC, ADDRESSES.optimism.OP, ADDRESSES.optimism.USDC, ADDRESSES.optimism.USDC_CIRCLE, ADDRESSES.optimism.USDT, "0x871f2F2ff935FD1eD867842FF2a7bfD051A5E527"] },
      "staking": { "owners": ["0xba91ffD8a2B9F68231eCA6aF51623B3433A89b13"], "tokens": ["0x871f2f2ff935fd1ed867842ff2a7bfd051a5e527"] }
    },
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0xba91ffD8a2B9F68231eCA6aF51623B3433A89b13"], "tokens": ["0x4691937a7508860F876c9c0a2a617E7d9E945D4B"] }
    },
    "era": {
      "tvl": { "owner": "0xE656d70bc3550e3EEE9dE7dC79367A44Fd13d975", "tokens": [ADDRESSES.era.WETH, ADDRESSES.era.ZK, ADDRESSES.era.USDC, "0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4"] }
    },
    "polygon_zkevm": {
      "tvl": { "owner": "0xF5d215d9C84778F85746D15762DaF39B9E83a2d6", "tokens": [ADDRESSES.polygon_zkevm.WETH, ADDRESSES.polygon_zkevm.USDC] }
    },
    "linea": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.linea.WETH, "0x3aAB2285ddcDdaD8edf438C1bAB47e1a9D05a9b4", ADDRESSES.linea.USDC, ADDRESSES.linea.USDT] }
    },
    "base": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.base.WETH, ADDRESSES.ethereum.cbBTC, ADDRESSES.base.USDbC, ADDRESSES.base.USDC, ADDRESSES.base.USDT] }
    },
    "mantle": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.mantle.WMNT, ADDRESSES.mantle.WETH, ADDRESSES.mantle.mETH, ADDRESSES.mantle.USDT, ADDRESSES.mantle.USDC, ADDRESSES.mantle.cmETH] }
    },
    "sonic": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.sonic.wS, "0x50c42dEAcD8Fc9773493ED674b675bE577f2634b", ADDRESSES.sonic.USDC_e] }
    },
    "berachain": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.berachain.WBERA, ADDRESSES.berachain.WBTC, ADDRESSES.berachain.WETH, ADDRESSES.berachain.USDC] }
    },
    "hyperliquid": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.hyperliquid.WHYPE, "0xBe6727B535545C67d5cAa73dEa54865B92CF7907", "0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463", ADDRESSES.hyperliquid.USDT0] }
    },
    "monad": {
      "tvl": { "owner": "0x5520385bFcf07Ec87C4c53A7d8d65595Dff69FA4", "tokens": [ADDRESSES.monad.WMON, ADDRESSES.monad.WETH, ADDRESSES.monad.USDC] }
    }
  },
  "everclear": {
    "methodology": "TVL counts all tokens held inside Everclear Spoke contracts (WETH, USDC, USDT, xPufETH).",
    "ethereum": {
      "tvl": {
        "owners": ["0xa05A3380889115bf313f1Db9d5f335157Be4D816","0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"],
        "tokens": ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","0xdac17f958d2ee523a2206206994597c13d831ec7","0xD7D2802f6b19843ac4DfE25022771FD83b5A7464"]
      }
    },
    "polygon": {
      "tvl": {
        "owners": ["0x7189C59e245135696bFd2906b56607755F84F3fD","0x26CFF54f11608Cd3060408690803AB4a43f462f2"],
        "tokens": ["0x7ceb23fd6bc0add59e62ac25578270cff1b9f619","0x3c499c542cef5e3811e1192ce70d8cc03d5c3359","0xc2132d05d31c914a87c6611c10748aeb04b58e8f"]
      }
    },
    "bsc": {
      "tvl": {
        "owners": ["0xa05A3380889115bf313f1Db9d5f335157Be4D816","0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"],
        "tokens": ["0x2170ed0880ac9a755fd29b2688956bd959f933f8","0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d","0x55d398326f99059ff775485246999027b3197955"]
      }
    },
    "avax": {
      "tvl": {
        "owners": ["0x9aA2Ecad5C77dfcB4f34893993f313ec4a370460","0x7EB63a646721de65eBa79ffe91c55DCE52b73c12"],
        "tokens": ["0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab","0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e","0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7"]
      }
    },
    "arbitrum": {
      "tvl": {
        "owners": ["0xa05A3380889115bf313f1Db9d5f335157Be4D816","0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"],
        "tokens": ["0x82af49447d8a07e3bd95bd0d56f35241523fbab1","0xaf88d065e77c8cC2239327C5EDb3A432268e5831","0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"]
      }
    },
    "optimism": {
      "tvl": {
        "owners": ["0xa05A3380889115bf313f1Db9d5f335157Be4D816","0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"],
        "tokens": ["0x4200000000000000000000000000000000000006","0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85","0x94b008aa00579c1307b0ef2c499ad98a8ce58e58"]
      }
    },
    "base": {
      "tvl": {
        "owners": ["0xa05A3380889115bf313f1Db9d5f335157Be4D816","0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"],
        "tokens": ["0x4200000000000000000000000000000000000006","0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913","0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2"]
      }
    },
    "xdai": {
      "tvl": {
        "owners": ["0xe0F010e465f15dcD42098dF9b99F1038c11B3056","0xeFa6Ac3F931620fD0449eC8c619f2A14A0A78E99"],
        "tokens": ["0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1","0x2a22f9c3b484c3629090feed35f17ff8f88f76f0","0x4ecaba5870353805a9f068101a40e0f32ed605c6"]
      }
    },
    "unichain": {
      "tvl": {
        "owners": ["0xa05A3380889115bf313f1Db9d5f335157Be4D816","0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"],
        "tokens": ["0x4200000000000000000000000000000000000006","0x078D782b760474a361dDA0AF3839290b0EF57AD6","0x588CE4F028D8e7B53B687865d6A67b3A54C75518"]
      }
    },
    "era": {
      "tvl": {
        "owners": ["0x7F5e085981C93C579c865554B9b723B058AaE4D3","0xbD82E5503461913a70566E66a454465a46F5C903"],
        "tokens": ["0x5aea5775959fbc2557cc8789bc1bf90a239d9a91","0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4","0x493257fD37EDB34451f62EDf8D2a0C418852bA4C"]
      }
    },
    "mantle": {
      "tvl": {
        "owners": ["0xe0F010e465f15dcD42098dF9b99F1038c11B3056","0xeFa6Ac3F931620fD0449eC8c619f2A14A0A78E99"],
        "tokens": ["0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111","0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9"]
      }
    },
    "apechain": {
      "tvl": {
        "owners": ["0xa05A3380889115bf313f1Db9d5f335157Be4D816","0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"],
        "tokens": ["0xcF800F4948D16F23333508191B1B1591daF70438","0x6234E5ef39B12EFdFcbd99dd7F452F27F3fEAE3b"]
      }
    },
    "scroll": {
      "tvl": {
        "owners": ["0xa05A3380889115bf313f1Db9d5f335157Be4D816","0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"],
        "tokens": ["0x5300000000000000000000000000000000000004","0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4","0xf55bec9cafdbe8730f096aa55dad6d22d44099df"]
      }
    },
    "ink": {
      "tvl": {
        "owners": ["0xa05A3380889115bf313f1Db9d5f335157Be4D816","0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"],
        "tokens": ["0x4200000000000000000000000000000000000006","0x0200C29006150606B650577BBE7B6248F58470c1"]
      }
    },
    "berachain": {
      "tvl": {
        "owners": ["0xa05A3380889115bf313f1Db9d5f335157Be4D816","0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"],
        "tokens": ["0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590"]
      }
    },
    "ronin": {
      "tvl": {
        "owners": ["0xdCA40903E271Cc76AECd62dF8d6c19f3Ac873E64","0x1FC1f47a6a7c61f53321643A14bEc044213AbF95"],
        "tokens": ["0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5","0x0b7007c13325c48911f73a2dad5fa5dcbf808adc"]
      }
    },
    "mode": {
      "tvl": {
        "owners": ["0xeFa6Ac3F931620fD0449eC8c619f2A14A0A78E99","0xD1daF260951B8d350a4AeD5C80d74Fd7298C93F4"],
        "tokens": ["0x4200000000000000000000000000000000000006","0xf0F161fDA2712DB8b566946122a5af183995e2eD","0xd988097fb8612cc24eeC14542bC03424c656005f"]
      }
    },
    "zircuit": {
      "tvl": {
        "owners": ["0xD0E86F280D26Be67A672d1bFC9bB70500adA76fe","0x2Ec2b2CC1813941b638D3ADBA86A1af7F6488A9E"],
        "tokens": ["0x9346A5043C590133FE900aec643D9622EDddBA57"]
      }
    },
    "linea": {
      "tvl": {
        "owners": ["0xc24dC29774fD2c1c0c5FA31325Bb9cbC11D8b751","0xC1E5b7bE6c62948eeAb40523B33e5d0121ccae94"],
        "tokens": ["0xA219439258ca9da29E9Cc4cE5596924745e12B93","0x176211869cA2b568f2A7D4EE941E073a821EE1ff","0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f"]
      }
    },
    "blast": {
      "tvl": {
        "owners": ["0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7","0x4e2bbbFb10058E0D248a78fe2F469562f4eDbe66"],
        "tokens": ["0x4300000000000000000000000000000000000004"]
      }
    },
    "taiko": {
      "tvl": {
        "owners": ["0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7","0x4e2bbbFb10058E0D248a78fe2F469562f4eDbe66"],
        "tokens": ["0x2def195713cf4a606b49d07e520e22c17899a736","0x07d83526730c7438048D55A4fc0b850e2aaB6f0b","0xA51894664A773981C6C112C43ce576f315d5b1B6"]
      }
    },
    "sonic": {
      "tvl": {
        "owners": ["0xa05A3380889115bf313f1Db9d5f335157Be4D816","0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"],
        "tokens": ["0x309C92261178fA0CF748A855e90Ae73FDb79EBc7"]
      }
    },
  },
  "avalaunch": {
    "methodology": "Within pool2, it counts the XAVA-AVAX staked in the farm",
    "avax": {
      "tvl": { "__empty": true },
      "pool2": { "__pool2": ["0x6E125b68F0f1963b09add1b755049e66f53CC1EA", "0x42152bDD72dE8d6767FE3B4E17a221D6985E8B25"] },
      "staking": { "__staking": [["0xE82AAE7fc62547BdFC36689D0A83dE36FF034A68", "0xA6A01f4b494243d84cf8030d982D7EeB2AeCd329"], "0xd1c3f94DE7e5B45fa4eDBBA472491a9f4B166FC4"] }
    }
  },
  "telcoin": {
    "polygon": {
      "tvl": { "__empty": true },
      "pool2": {
        "resolveLP": true,
        "tokensAndOwners": [
          ["0xd208168d2a512240eb82582205d94a0710bce4e7", "0xb967c3Fa919BB0a8f51cF40C60488b6EC9e8708B"],
          ["0x39cd55ff7e7d7c66d7d2736f1d5d4791cdab895b", "0x62eCa4D9Dbeac613ad86946b51A6225A1a0d14f4"],
          ["0x5c6ee304399dbdb9c8ef030ab642b10820db8f56", "0x1e72c558a564B23b302bFd96c51dE41267bA26a9"],
          ["0xf099b7c3bd5a221aa34cb83004a50d66b0189ad0", "0x20Ed193cA4E36b2beBcad150089Fe3D99298d425"],
          ["0xd5d7bc115b32ad1449c6d0083e43c87be95f2809", "0xefC6d17276C640169b352B37226949f5Eab35384"],
          ["0xa5cabfc725dfa129f618d527e93702d10412f039", "0xbdb6a789d91815564981db3c7acb015e2577bc60"],
          ["0xe88e24f49338f974b528ace10350ac4576c5c8a1", "0x51cfb74628c7484c9128d979650da2512947e532"],
          ["0xfc2fc983a411c4b1e238f7eb949308cf0218c750", "0x09315f2577c2bccee0119790f706eb70dd67c2df"],
          ["0x9b5c71936670e9f1f36e63f03384de7e06e60d2a", "0xdef7f3f6a940a9d2a01814b74b3e545dd364a02f"],
          ["0x4917bc6b8e705ad462ef525937e7eb7c6c87c356", "0x8e8def06290d25b999a1e5d90710e09c0b2b5280"],
          ["0xaddc9c73f3cbad4e647eaff691715898825ac20c", "0x5c120f6e17130c38733b675125d74e4efc5b4425"],
          ["0xe88e24f49338f974b528ace10350ac4576c5c8a1", "0xF8bdC7bC282847EeB5d4291ec79172B48526e9dE"],
          ["0xfc2fc983a411c4b1e238f7eb949308cf0218c750", "0xEda437364DCF8AB00f07b49bCc213CDf356b3962"],
          ["0xa5cabfc725dfa129f618d527e93702d10412f039", "0x84B3c86D660D680847258Fd20aAA1274Cc35EAcd"]
        ]
      }
    }
  },
  "atmossoft": {
    "misrepresentedTokens": true,
    "fantom": {
      "tvl": { "__empty": true },
      "pool2": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "tokensAndOwners": [["0x662db0c6fa77041fe4901149558cc70ca1c8e874", "f043f876d3d220acce029ca76c9572f0449e5e71"]]
      }
    },
    "bsc": {
      "pool2": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "tokensAndOwners": [
          ["0xaF18cde26fdd22561df2a02958CbA092f41875d8", "0x282FFbE782F903340A14955649032302e8020b9C"],
          ["0xdf825e486d9d15848a36c113b7725d7923e886a4", "0xa65d60e8a71dBDbb14B6eE7073522546FE73CFE4"]
        ]
      }
    }
  },
  "imbtc": {
    "methodology": "TVL for imBTC consists of the BTC deposits in custody that were used to mint imBTC",
    "hallmarks": [["2024-01-31", "Project ceases operation"]],
    "ethereum": { "__empty": true },
    "bitcoin": { "tvl": { "__btcBook": "imbtc" } }
  },
  "mobox": {
    "bsc": {
      "tvl": { "__empty": true },
      "pool2": { "__pool2": [["0xdad49e63f97c967955975490a432de3796c699e6", "0xa5f8c5dbd5f286960b9d90548680ae5ebff07652"], "0x8FA59693458289914dB0097F5F366d771B7a7C3F"] },
      "staking": { "__staking": [["0xdad49e63f97c967955975490a432de3796c699e6", "0xf8c1bA88F1E4aeD152F945F1Df2a8fdc36127B5f", "0x3bD6a582698ECCf6822dB08141818A1a8512c68D", "0x5E7Eb57B163b78e93608E773e0F4a88A55d7C28F"], "0x3203c9e46ca618c8c1ce5dc67e7e9d75f5da2377"] }
    }
  },
  "know-to-earn": {
    "iotex": {
      "tvl": { "__empty": true },
      "pool2": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "owner": "0x74d80963d1f2db8536be25a9b618c6ed7a20d140",
        "tokens": ["0x767eded9032ce68dc4e475addf0059baab936585"]
      }
    }
  },
  "rarify": {
    "methodology": "RARE/WXDAI LP on Honeyswap can be staked in a pool2 contract",
    "xdai": {
      "tvl": { "__empty": true },
      "pool2": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "owner": "0x79bfE41cDbF6b7E949B93B46a2cBEFB497d71c20",
        "tokens": ["0x5805bb63e73ec272c74e210d280c05b41d719827"]
      }
    }
  },
  "sheesha": {
    "bsc": {
      "tvl": { "__empty": true },
      "pool2": {
        "__resolveUnknownTokenLP": true,
        "owner": "0x5d350F07c1D9245c1Ecb7c622c67EDD49c6a0A35",
        "tokens": ["0xB31Ecb43645EB273210838e710f2692CC6b30a11"]
      },
      "staking": { "__staking": ["0xC77CfF4cE3E4c3CB57420C1488874988463Fe4a4", "0x232fb065d9d24c34708eedbf03724f2e95abe768"] }
    }
  },
  "0xacid": {
    "start": "2023-03-10",
    "arbitrum": {
      "tvl": { "__empty": true },
      "staking": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "owners": ["0x00a842038a674616f6a97e62f80111a536778282"],
        "tokens": ["0x29C1EA5ED7af53094b1a79eF60d20641987c867e"],
        "lps": ["0x73474183a94956cd304c6c5a504923d8150bd9ce"]
      }
    }
  },
  "ambire-wallet": {
    "methodology": "TVL for Ambire Wallet consists of the staking of WALLET.",
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": { "__staking": ["0x47cd7e91c3cbaaf266369fe8518345fc4fc12935", "0x88800092ff476844f74dc2fc427974bbee2794ae"] }
    }
  },
  "bacondao": {
    "ethereum": {
      "tvl": { "__empty": true },
      "pool2": { "__pool2": ["0x27FC644f86a5D4Ad0809BFF8EafCc528E5F4e034", "0xc992a50169f6075d52013118355c633bf92ae853"] },
      "staking": { "__staking": ["0x27FC644f86a5D4Ad0809BFF8EafCc528E5F4e034", "0x34f797e7190c131cf630524655a618b5bd8738e7"] }
    },
    "bsc": {
      "tvl": { "__empty": true },
      "pool2": { "__pool2": ["0x529943544Eb7f1765b4009862420fBd22A6D5eE7", "0xdf2f838fda9294a7dedb25c815c4f8a3dc30851c", null] },
      "staking": { "__staking": ["0x1624f949b1c972eA24e9BeeAd7A0f60E201D6eD3", "0x0615dbba33fe61a31c7ed131bda6655ed76748b1"] }
    }
  },
  "beamable-network": {
    "timetravel": false,
    "methodology": "Counts the number of BMB tokens locked across Core Anchorage wallets and Beamable Network program vaults.",
    "solana": {
      "tvl": { "__empty": true },
      "staking": {
        "tokens": ["BMBtwz6LFDJVJd2aZvL5F64fdvWP3RPn4NP5q9Xe15UD"],
        "owners": [
          "7xQVXzXC5fz4LEq5PsHjKkFaQsenEp8KBLfsU8vXHixT",
          "GkqBtacaEuCGr5KortDHUF7WNT6bSasCsRSEpoBbgPKH",
          "9zx2QN7DwGdDdU81SjKFve31F8Midg8RHs7wgrE7KguR",
          "SiuEivQxySKyoSLgq2HaRSp68TEU85uRAfz56kk6T45",
          "6pZERJjcMpNjPZ6ovnXWC6LzwkXLAYgAR1URAEs63cWC",
          "2zMVb81qUwusaT4EbK8gvpyJBHdJ8uPwMcrefSkLMU6Z",
          "HBjL14QGKnfVtdxVRQRong1WHnYb89gyjBBQtwLQSLVi"
        ]
      }
    }
  },
  "billion-happiness": {
    "methodology": "Pool 2 TVL includes the BHC-WBNB Pancake LP and staking TVL are the BHC tokens staked into the emotion pools",
    "bsc": {
      "tvl": { "__empty": true },
      "staking": { "__staking": [["0xa4712bd37cdE563bDfccCfa6DE5E5c2b1Da5572B", "0xE9bFC901644B85161BAFa103ecf4478a87D398E1", "0xE40525c866Ab074e4103e5d26570Dc61f1729B6d"], "0x6fd7c98458a943f469E1Cf4eA85B173f5Cd342F4"] },
      "pool2": { "__staking": ["0xC5c482a4Ed34b80B861B4e6Eb28664a46bd3eC8B", "0x851dB01B337Ee3E5Ab161ad04356816F09EA01dc"] }
    },
    "ethpow": {
      "tvl": { "__staking": ["0x28d1F6698c20802B8c38Ae83903046F61e60F529", ADDRESSES.ethpow.BHC] },
      "pool2": { "__pool2": ["0xe3891B87204870FC26dE020fc9d92eA9848Df74f", "0x899fED261A7df2761CF0b6f7556B80669D135802"] },
      "staking": { "__staking": ["0x2B7c8977087420E0f29069B4DB74bF35E23FAA8a", ADDRESSES.ethpow.WETHW] }
    }
  },
  "blastex": {
    "blast": {
      "tvl": { "__empty": true },
      "pool2": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "owner": "0x8C1DBB14c012bCCdB3477bc1625A3DCfD0F61ac2",
        "tokens": ["0xdaE375F817B465f3a226284Af0Ad5Fa2387274EA"]
      },
      "staking": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "owner": "0x8C1DBB14c012bCCdB3477bc1625A3DCfD0F61ac2",
        "tokens": ["0x5C598E410De1214D77EBB166102471065E7b2596"],
        "lps": ["0xdaE375F817B465f3a226284Af0Ad5Fa2387274EA"]
      }
    }
  },
  "bmcc": {
    "misrepresentedTokens": true,
    "methodology": "Counts liquidty on the staking and pool2s",
    "bsc": {
      "tvl": { "__empty": true },
      "staking": { "__staking": [["0xD5DBAeb18943ed04CD84Cd3378D67ea94Da0F043", "0xf7b95c668a31eb448bc4dea5e48a0efbef2fb63b", "0x74ec16b956678e337b88099b7bD0a234e79F60EF"], "0xb6D8EE99D5d6cfe7D80b666e6fF5e74e3f72756b"] },
      "pool2": { "__pool2": [["0xAf3346DE11b838c4ea0D8E369486eB9BACeEEb02", "0x65C9DaFddA01e1C81C671Dc20ec0c6341Fe3085e", "0x0c89c0407775dd89b12918b9c0aa42bf96518820", "0xa36037dC26C5C02e864eBA969A312320E6487269"], ["0x9cef33639c75DD023a90A8ae290C2b51D1C44716", "0x71810Ae9914e52718965D65cE303E652C08aE25B", "0xbAaf55b067c4240C4F7b2665Bf61Dd97A092BD65", "0x891D48D1261B2890773fE9407B57A965eCd80740", "0x35775a34Cb44805421429d77d6c6C4f90D43daa5"], null] }
    }
  },
  "bring": {
    "misrepresentedTokens": true,
    "methodology": "Counts liquidty of the Pools through their chefContracts",
    "ethereum": {
      "tvl": {
        "resolveLP": true,
        "tokensAndOwners": [
          ["0xf7413489c474ca4399eee604716c72879eea3615", "0xDfa3D27Aa7E93527b2075Da5b7911184449f2c27"],
          ["0xa4ef4b0b23c1fc81d3f9ecf93510e64f58a4a016", "0xDfa3D27Aa7E93527b2075Da5b7911184449f2c27"],
          ["0xd9c2d319cd7e6177336b0a9c93c21cb48d84fb54", "0xDfa3D27Aa7E93527b2075Da5b7911184449f2c27"],
          ["0x89bd2e7e388fab44ae88bef4e1ad12b4f1e0911c", "0xDfa3D27Aa7E93527b2075Da5b7911184449f2c27"]
        ]
      },
      "staking": { "__staking": ["0xDfa3D27Aa7E93527b2075Da5b7911184449f2c27", "0x3Ecb96039340630c8B82E5A7732bc88b2aeadE82"] }
    },
    "bsc": {
      "tvl": {
        "resolveLP": true,
        "tokensAndOwners": [
          ["0x91bf1ad3868a45bf710c516a7869dcf3e61b8b7b", "0xe9d8b35e1D51b9C17504E5903C3F4D5b14d8c29E"],
          ["0x2dC3A32895D13732a151A17C0f40E695C73AD797", "0xe9d8b35e1D51b9C17504E5903C3F4D5b14d8c29E"],
          ["0x21b64d891805b0c6437e8209146e60ad87ebb499", "0xe9d8b35e1D51b9C17504E5903C3F4D5b14d8c29E"],
          ["0x843CbC1732aE7D7ba0533C6380989DACec315FfE", "0xe9d8b35e1D51b9C17504E5903C3F4D5b14d8c29E"],
          ["0x6bfd576220e8444ca4cc5f89efbd7f02a4c94c16", "0xe9d8b35e1D51b9C17504E5903C3F4D5b14d8c29E"],
          ["0x5b6ebb33eea2d12eefd4a9b2aeaf733231169684", "0xe9d8b35e1D51b9C17504E5903C3F4D5b14d8c29E"],
          ["0x37dfacfaeda801437ff648a1559d73f4c40aacb7", "0xbb6e99F9565d872F7D75850c43D9CA5c46c6fF0c"],
          ["0x1a3057027032a1af433f6f596cab15271e4d8196", "0xbb6e99F9565d872F7D75850c43D9CA5c46c6fF0c"],
          ["0xc7d8d35eba58a0935ff2d5a33df105dd9f071731", "0xbb6e99F9565d872F7D75850c43D9CA5c46c6fF0c"],
          ["0x510b29a93ebf098f3fc24a16541aaa0114d07056", "0xbb6e99F9565d872F7D75850c43D9CA5c46c6fF0c"],
          ["0x9e0eaf240eebed129136f4f733480feabbca136b", "0xbb6e99F9565d872F7D75850c43D9CA5c46c6fF0c"],
          ["0xf74ee1e10e097dc326a2ad004f9cc95cb71088d3", "0xbb6e99F9565d872F7D75850c43D9CA5c46c6fF0c"]
        ]
      },
      "staking": { "__staking": [["0xe9d8b35e1D51b9C17504E5903C3F4D5b14d8c29E", "0xbb6e99F9565d872F7D75850c43D9CA5c46c6fF0c", "0x3877D0E8DbB9e69beD6abDd8A40ED6A4a26EB44f"], "0x939D5A13cf0074586a2Dcf17bC692B2D3CCdD517"] },
      "pool2": { "__pool2": [["0xe9d8b35e1D51b9C17504E5903C3F4D5b14d8c29E", "0xbb6e99F9565d872F7D75850c43D9CA5c46c6fF0c", "0x3877D0E8DbB9e69beD6abDd8A40ED6A4a26EB44f"], ["0xE412f518A6a39351c965E201A329eC83047FEb4A"], null] }
    },
    "harmony": {
      "tvl": { "__empty": true },
      "staking": {
        "resolveLP": true,
        "tokensAndOwners": [["0x3Ecb96039340630c8B82E5A7732bc88b2aeadE82", "0x3d4ACf89997148DcF2D266Ceb52A8bea2a7d4B2c"]]
      }
    }
  },
  "coinwind": {
    "methodology": "TVL counts deposits made to Lossless single asset pools on Ethereum, Heco and Binance Smart Chain and to the various LP farms available on Heco and BSC.",
    "ethereum": { "tvl": { "__empty": true } },
    "bsc": {
      "tvl": { "__empty": true },
      "staking": { "__staking": ["0x4711D9b50353fa9Ff424ceCa47959dCF02b3725A", "0x422e3af98bc1de5a1838be31a56f75db4ad43730"] },
      "pool2": { "__pool2": ["0x4711D9b50353fa9Ff424ceCa47959dCF02b3725A", "0xf16d5142086dbf7723b0a57b8d96979810e47448"] }
    },
    "heco": {
      "tvl": { "__empty": true },
      "staking": { "__empty": true },
      "pool2": { "__empty": true }
    }
  },
  "core-powercity-io": {
    "start": "2023-12-12",
    "methodology": "No external tokens/coins staked/locked. Only protocol token WATT and WATT-PLS-LP staked within protocol.",
    "pulse": {
      "tvl": { "__empty": true },
      "staking": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "owner": "0xa42BadB71271e9A460ED93C501308ECaab770c37",
        "tokens": ["0xDfdc2836FD2E63Bba9f0eE07901aD465Bff4DE71"],
        "lps": ["0x956f097E055Fa16Aad35c339E17ACcbF42782DE6"]
      },
      "pool2": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "owner": "0xa42BadB71271e9A460ED93C501308ECaab770c37",
        "tokens": ["0x956f097E055Fa16Aad35c339E17ACcbF42782DE6"]
      }
    }
  },
  "croissant": {
    "misrepresentedTokens": true,
    "methodology": "LPs and tokens in masterchef",
    "cronos": {
      "tvl": { "__empty": true },
      "staking": { "__staking": [["0x127A5b49E63FadFBA2bc370D44034F170d88C7e6"], "0xa0C3c184493f2Fae7d2f2Bd83F195a1c300FA353"] },
      "pool2": { "__pool2": [["0x127A5b49E63FadFBA2bc370D44034F170d88C7e6"], ["0xde991150329dbe53389db41db459cae3ff220bac"], null] }
    }
  },
  "datamine": {
    "methodology": "Pool2 counts all the permanent liquidity in LOCK/WETH Uniswap v2 pool. Staking counts all the tokens locked-in to mint FLUX/ArbiFLUX/LOCK",
    "hallmarks": [[1727644318, "Lockquidity Launch"]],
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": {
        "tokensAndOwners": [["0xF80D589b3Dbe130c270a69F1a69D050f268786Df", "0x469eDA64aEd3A3Ad6f868c44564291aA415cB1d9"]]
      }
    },
    "arbitrum": {
      "tvl": { "__empty": true },
      "staking": {
        "tokensAndOwners": [
          ["0xF80D589b3Dbe130c270a69F1a69D050f268786Df", "0x64081252c497FCfeC247a664e9D10Ca8eD71b276"],
          ["0x64081252c497FCfeC247a664e9D10Ca8eD71b276", "0x454F676D44DF315EEf9B5425178d5a8B524CEa03"]
        ]
      },
      "pool2": {
        "tokensAndOwners": [
          [ADDRESSES.arbitrum.WETH, "0x0C93A1D3F68a0554d37F3e7AF3a1442a94405E7A"],
          ["0x454F676D44DF315EEf9B5425178d5a8B524CEa03", "0x0C93A1D3F68a0554d37F3e7AF3a1442a94405E7A"]
        ]
      }
    }
  },
  "diamond-coin": {
    "fantom": {
      "tvl": { "__empty": true },
      "pool2": { "__pool2": ["0xDDa0F0E1081b8d64aB1D64621eb2679F93086705", ["0xf5e8B220843EC7114B91AfF0D25342c24eB953b5", "0x2f1569094CB256fB745901fa92e57aF011D32B2C"], null] }
    }
  },
  "dna": {
    "wc": {
      "tvl": { "__empty": true },
      "staking": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "owner": "0x66512DbB955F18356bf32b908172264e3E08C289",
        "tokens": ["0xED49fE44fD4249A09843C2Ba4bba7e50BECa7113"],
        "lps": ["0x84bf434c13C28f6b7Fa245d7209831ADc57a6597"]
      }
    }
  },
  "dopex": {
    "ethereum": { "tvl": { "__empty": true } },
    "bsc": { "tvl": { "__empty": true } },
    "avax": { "tvl": { "__empty": true } },
    "arbitrum": {
      "tvl": {
        "tokensAndOwners": [
          ["0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55", "0x05E7ACeD3b7727f9129E6d302B488cd8a1e0C817"],
          ["0x32Eb7902D4134bf98A28b963D26de779AF92A212", "0xd74c61ca8917Be73377D74A007E6f002c25Efb4e"],
          ["0x5979D7b546E38E414F7E9822514be443A4800529", "0x475a5a712B741b9Ab992E6Af0B9E5adEE3d1851B"],
          ["0x912CE59144191C1204E64559FE8253a0e49E6548", "0xDF3d96299275E2Fb40124b8Ad9d270acFDcc6148"],
          ["0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55", "0x10FD85ec522C245a63239b9FC64434F58520bd1f"],
          ["0x32Eb7902D4134bf98A28b963D26de779AF92A212", "0xCdaACF37726Bf1017821b5169e22EB34734B28A8"],
          ["0x5979D7b546E38E414F7E9822514be443A4800529", "0xFca61E79F38a7a82c62f469f55A9df54CB8dF678"],
          ["0x7f90122BF0700F9E7e1F688fe926940E8839F353", "0xf71b2B6fE3c1d94863e751d6B455f750E714163C"],
          ["0x7f90122BF0700F9E7e1F688fe926940E8839F353", "0xb4ec6B4eC9e42A42B0b8cdD3D6df8867546Cf11d"],
          ["0x7f90122BF0700F9E7e1F688fe926940E8839F353", "0x32449DF9c617C59f576dfC461D03f261F617aD5a"]
        ]
      }
    }
  },
  "dragon": {
    "misrepresentedTokens": true,
    "base": {
      "tvl": { "__empty": true },
      "staking": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "chain": "ethereum",
        "owner": "0xbb595F34190c6eA1adD1C78F6d12DF181542763c",
        "tokens": ["0x528757e34a5617aa3aabe0593225fe33669e921c"],
        "lps": ["0xd53881caee96d3a94fd0e2eb027a05fd44d8c470"]
      },
      "pool2": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "chain": "ethereum",
        "owner": "0x5F020174baEe486d88bea279195a0A3bCD40A41E",
        "tokens": ["0xd53881caee96d3a94fd0e2eb027a05fd44d8c470"],
        "lps": ["0xd53881caee96d3a94fd0e2eb027a05fd44d8c470"]
      }
    }
  },
}
