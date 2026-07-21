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
  "free-protocol": {
    "merlin": {
      "tvl": {
        "owners": ["0xA6E02b4445dB933FCD125a449448326d6505B189", "0x79af88101aB5589aB0f92a2bbAbe2bAe1c602806", "0xD5f051fF82D90D086B57842e6Aae8f2FAa80Cb1c", "0xE12382e046DB998DE89aF19Ca799CbB757106781"],
        "tokens": [ADDRESSES.merlin.WBTC_1, "0xC5BD913eE3BEFD4721C609177F29a8770ACD7242", "0x41D9036454BE47d3745A823C4aaCD0e29cFB0f71"]
      }
    },
    "ethereum": {
      "tvl": {
        "owners": ["0x1B5668Ca8edfC8AF5DcB9De014b4B08ed5d0615F", "0x3111653DB0e7094b111b8e435Df9193b62C2C576", "0xd6572c7cd671ecf75d920adcd200b00343959600", "0xa97Fe3E9c1d3Be7289030684eD32A6710d2d02bA", "0xeea3A032f381AB1E415e82Fe08ebeb20F513c42c"],
        "tokens": [ADDRESSES.ethereum.USDC, "0x7122985656e38bdc0302db86685bb972b145bd3c", ADDRESSES.ethereum.USDT, "0x7122985656e38BDC0302Db86685bb972b145bD3C"]
      }
    },
    "arbitrum": {
      "tvl": {
        "owners": ["0xC178AE294bC3623e6dfDF07C9ca79c6dB692f032", "0xBA43F3C8733b0515B5C23DFF46F47Af6EB46F85C"],
        "tokens": [ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.USDC_CIRCLE]
      }
    },
    "manta": {
      "tvl": { "owners": ["0x19727db22Cba70B1feE40337Aba69D83c6741caF"], "tokens": [ADDRESSES.berachain.STONE] }
    },
    "bsc": {
      "tvl": {
        "owners": ["0x40a25786937eCc0643e78ca40Df02Db4dff27bb0", "0xF8aeD4da2598d3dF878488F40D982d6EcC8B13Ad", "0xBA43F3C8733b0515B5C23DFF46F47Af6EB46F85C", "0x0A80028d73Faaee6e57484E3335BeFda0de7f455"],
        "tokens": [ADDRESSES.ethereum.FDUSD, ADDRESSES.bsc.BTCB, ADDRESSES.ethereum.FDUSD, "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7"]
      }
    },
    "polygon": {
      "tvl": {
        "owners": ["0x7Ab202c0161357Ca4C8FD2E09AdFcD45F3aAfb41"],
        "tokens": ["0x4f64a90409b8361cde7c3103e87e9c8511501c5a", "0x57912d26a5285bc5d614bbf4e9be0e42406ede54"]
      }
    },
    "kroma": { "tvl": { "__empty": true } },
    "hemi": {
      "tvl": {
        "owners": ["0x25aB3Efd52e6470681CE037cD546Dc60726948D3"],
        "tokens": ["0xF469fBD2abcd6B9de8E169d128226C0Fc90a012e", "0x9BFA177621119e64CecbEabE184ab9993E2ef727", "0xF9775085d726E782E83585033B58606f7731AB18", "0x93919784C523f39CACaa98Ee0a9d96c3F32b593e", ADDRESSES.goat.uBTC]
      }
    }
  },
  "gfs": {
    "iotex": {
      "tvl": { "__empty": true },
      "pool2": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "tokensAndOwners": [["0x19f3cb6a4452532793d1605c8736d4a94f48752c", "0x1ba725d2ba56482f11fee3642f1c739d25018e4d"]]
      }
    }
  },
  "gft": {
    "iotex": {
      "tvl": { "__empty": true },
      "pool2": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "tokensAndOwners": [
          ["0x53bdd401a871bd0f84e94619edcc0c24489d4aab", "0xde5914a97cc5066751624f053d719f67a4d69383"],
          ["0x5d0f4ca481fd725c9bc6b415c0ce5b3c3bd726cf", "0x4346a618c2e3fd4cfa821e91216eaf927bd46ddd"]
        ]
      }
    }
  },
  "giveth": {
    "methodology": "Counts GIV staked in all farms",
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": { "tokensAndOwners": [["0x900db999074d9277c5da2a43f252d74366230da0", "0x4B9EfAE862a1755F7CEcb021856D467E86976755"]] },
      "pool2": {
        "tokensAndOwners": [
          ["0x900db999074d9277c5da2a43f252d74366230da0", "0xbeba1666c62c65e58770376de332891b09461eeb"],
          ["0x900db999074d9277c5da2a43f252d74366230da0", "0xc3151A58d519B94E915f66B044De3E55F77c2dd9"],
          ["0x900db999074d9277c5da2a43f252d74366230da0", "0x7819f1532c49388106f7762328c51ee70edd134c"]
        ]
      }
    },
    "xdai": {
      "tvl": { "__empty": true },
      "staking": {
        "__resolveUnknownTokenLP": true,
        "owners": ["0x24F2d06446AF8D6E89fEbC205e7936a602a87b60"],
        "tokens": ["0x4f4f9b8d5b4d0dc10506e5551b0513b61fd59e75"]
      },
      "pool2": {
        "__resolveUnknownTokenLP": true,
        "owners": ["0x08ea9f608656A4a775EF73f5B187a2F1AE2ae10e", "0x55FF0cef43F0DF88226E9D87D09fA036017F5586", "0xB7189A7Ea38FA31210A79fe282AEC5736Ad5fA57"],
        "tokens": ["0x4f4f9b8d5b4d0dc10506e5551b0513b61fd59e75"]
      }
    }
  },
  "golden-otter-hub": {
    "methodology": "TVL is calculated by checking the balances of GOLDEN_OTTER and OTTERVERSE tokens staked in their respective contracts, and valuing them using their LP pairs against WLD.",
    "wc": {
      "tvl": { "__empty": true },
      "staking": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "tokensAndOwners": [
          ["0x57268aFa4E496684611aAFB1E20D2116283C487e", "0xc631A1A2E53984b461556b030A532BB83Bf49aEb"],
          ["0xBD179ad384a11Ac2162c0E808212ee3699D18447", "0x566c5441de4e952bc40aEE33004e42Da2Bc1e982"]
        ],
        "lps": ["0xccbbace82078705cab7f49b22fbdebfc3eb58840", "0x9704d4c477a865ca359605d701aeffa1c4553e81"]
      }
    }
  },
  "lns": {
    "misrepresentedTokens": true,
    "methodology": "LNS tokens locked in the staking contract are counted towards staking.",
    "smartbch": {
      "tvl": { "__empty": true },
      "staking": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "owner": "0xBE7E034c86AC2a302f69ef3975e3D14820cC7660",
        "tokens": ["0x35b3Ee79E1A7775cE0c11Bd8cd416630E07B0d6f"],
        "lps": ["0x7f3F57C92681c9a132660c468f9cdff456fC3Fd7"]
      }
    }
  },
  "matstake": {
    "methodology": "Sums the MAT token balance held by the LiquidStakingPool contract and all staking pools to represent total user deposits.",
    "timetravel": true,
    "matchain": {
      "tvl": { "__empty": true },
      "staking": {
        "owners": [
          "0xa1843e71d1390d4A31469A53EeEfBB2f9AAe34ed", "0xff5eb1345aa5d4c948c227742fcd32157539e480", "0xfa38f584f561642ff0d1ab67b5a175798668a047",
          "0xf9ff433f14f237ce6643257ca4cd5aec355eaee7", "0xeef37e218087bca2f4c3c6c4c50f3d3b51b2eb4d", "0xdd1904dcf7e0b6dff60bd9729f626b076999e18f",
          "0xdb604be88482ce061fbc2595e619f967de1a7502", "0xd899cd3cafb1c9f6d585c36649592956d3df5ef9", "0xc3258af62e46b502700c34ed7c3128f99f0fc532",
          "0xc021a95e3ad7d4e06745c4a12438a960c33859d7", "0xb4175a66e28f2c348959872b28af0d12f891201f", "0xa3be9646116f834d0f9f1a035fdad6862b5f0a2a",
          "0x9c4c30d5cd29c6d24cf1a712d93b756cbf5071ba", "0x96b5f62604729ed5b7219f1b3f15a8359e0a86fb", "0x8aa82b86056af2dd5cdaab45eefe500c84d0af82",
          "0x739110f0233b8598957af1321920787c13142910", "0x53f91b6ae02c8cdbc22565f7f7a158add6f1de6e", "0x4a47d64b074d730868623d89ec633d16adf53212",
          "0x443d8318224c59c31987ea310033d0dc47a10d88", "0x256b02b26c67029b2881ab5d493cf8e5068d5fcc", "0x0de1a88dcf7fd12c54d9ac0807c990f26bd1c121",
          "0x0b0381a2c4c3a537c614afe71334c9f387718922"
        ],
        "tokens": [ADDRESSES.matchain.MAT]
      }
    }
  },
  "mtgo": {
    "iotex": {
      "tvl": { "__empty": true },
      "pool2": {
        "__resolveUnknownTokenLP": true,
        "tokensAndOwners": [["0x2a382b6d2dac1cba6e4820fd04e3c2c14e1aa7b2", "0x1781d2e9b4c7c0a3657411a64d2c1dfc50118772"]],
        "lps": ["0x2a382b6d2dac1cba6e4820fd04e3c2c14e1aa7b2"]
      }
    }
  },
  "newthrone": {
    "methodology": "THRO tokens in the Game contract, which represents the current balance of the game (total spent - total claimed).",
    "base": {
      "tvl": { "__empty": true },
      "staking": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "owner": "0x61C3A357bc3ca51b80eCD36CB1Ae37e5465C6701",
        "tokens": ["0x0f929C29dcE303F96b1d4104505F2e60eE795caC"],
        "lps": ["0x3267afBDFA739D4039D03172A4a80e4bb91370b6"]
      }
    }
  },
  "papparico-finance": {
    "cronos": {
      "tvl": { "__empty": true },
      "staking": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "owners": ["0x535503d5c23bCA9896383003A46A8AD6c9CB2fe2", "0xFc8d5d6B280BF5E8d8DB12d0fF8a0f7d1A6ECf78", "0x828CC5D75594e4d0D072566cC07F64E863A0d11E"],
        "tokens": ["0x59BAfb7168972EcCA5e395F7dA88e71eCe47a260", "0x961105dD9bE34B64A27251d72B6D8F086847bc1c"],
        "lps": ["0xb036145476Ad16782eC05C7EC340D7e3cE6D09b7", "0xA99F134FC1e922Bc78Aa78c5897ce1eeF925b179"]
      },
      "pool2": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "owners": ["0x3E35810A663c7eE28a0A6f6A0984146CbB163c6c", "0x2490AFBf1609119bB76E5e936f4ce4cBed815947"],
        "tokens": ["0xb036145476Ad16782eC05C7EC340D7e3cE6D09b7", "0xA99F134FC1e922Bc78Aa78c5897ce1eeF925b179"]
      }
    }
  },
  "pizza-city": {
    "methodology": "Pizza City is a gamified DeFi protocol on Base featuring Dutch auctions. TVL: PIZZA tokens staked for rewards and governance power (user-withdrawable). Note: Protocol-owned liquidity (~$33k locked Uniswap V3 LP) is not included as it cannot be withdrawn by users.",
    "base": {
      "tvl": { "__empty": true },
      "staking": {
        "owner": "0x2166Ea481f03778c969667675dBD6A4FdAa9FE78",
        "tokens": ["0x13b628fF6Db92070C0FBad79523240E0f5DeFb07"]
      }
    }
  },
  "ultronStakingHub": {
    "misrepresentedTokens": true,
    "ultron": {
      "tvl": { "__empty": true },
      "staking": {
        "__resolveUnknownTokenLP": true,
        "owner": "0x60768787077a8411d8f626ce35333fa3f02be602",
        "tokens": [ADDRESSES.ultron.wULX]
      }
    }
  },
  "unite-finance": {
    "methodology": "Pool2 deposits consist of UNITE/ONE and USHARE/ONE LP tokens deposits while the staking TVL consists of the TSHARES tokens locked within the Boardroom contract(0x68BeEc29183464e2C80Aa9B362db8b0c0eB826bd).",
    "harmony": {
      "tvl": { "__empty": true },
      "pool2": {
        "resolveLP": true,
        "owner": "0xe3F4E2936F0Ac4104Bd6a58bEbd29e49437710Fe",
        "tokens": ["0xa0377f9fd3de5dfefec34ae4807e9f2b9c56d534", "0x6372d14d29f07173f4e51bb664a4342b4a4da9e8", "0xeE2208256800398424a45Fe9F135AD0b60DeAE0C", "0xe302A970E80094a3abB820Eda275FAC5848b5bdA"],
        "abis": { "getReservesABI": "function getReserves() view returns (uint256 _reserve0, uint256 _reserve1)" }
      },
      "staking": { "__staking": ["0x68BeEc29183464e2C80Aa9B362db8b0c0eB826bd", "0xd0105cff72a89f6ff0bd47e1209bf4bdfb9dea8a"] }
    }
  },
  "unore": {
    "start": "2021-07-12",
    "kava": { "tvl": { "__empty": true } },
    "ethereum": {
      "tvl": { "tokensAndOwners": [[ADDRESSES.null, "0x929F524473D7B86acc0ADD87B1874Bdf63Cf0Ab1"], [ADDRESSES.ethereum.USDT, "0x442e9fe958202Dc29d7018c1AA47479F2159D8a0"], [ADDRESSES.ethereum.USDC, "0xF37c0901662f39039AFBd3c2546e3141c091e014"]] },
      "staking": { "tokens": ["0x474021845c4643113458ea4414bdb7fb74a01a77"], "owners": ["0x076E2A501FD0DA41E5A659aB664b2B6792B80Fa2", "0x8978d08bd89B9415eB08A4D52C1bDDf070F19fA2", "0x442e9fe958202Dc29d7018c1AA47479F2159D8a0", "0xF37c0901662f39039AFBd3c2546e3141c091e014", "0x929F524473D7B86acc0ADD87B1874Bdf63Cf0Ab1"] }
    },
    "bsc": {
      "tvl": { "tokensAndOwners": [[ADDRESSES.bsc.USDC, "0xabb83630993984C54fd60650F5A592407C51e54b"]] },
      "staking": { "tokens": ["0x474021845c4643113458ea4414bdb7fb74a01a77"], "owners": ["0xabb83630993984C54fd60650F5A592407C51e54b", "0xeF21cB3eE91EcB498146c43D56C2Ef9Bae6B7d53"] }
    },
    "rollux": {
      "tvl": { "tokensAndOwners": [[ADDRESSES.optimism.WETH_1, "0x7393310FdC8ed40B35D2afD79848BC7166Ae0474"]] },
      "staking": { "tokens": ["0x570baA32dB74279a50491E88D712C957F4C9E409"], "owners": ["0x8685C2b4D2024805a1FF6831Bc4cc8569457811D", "0x7393310FdC8ed40B35D2afD79848BC7166Ae0474"] }
    }
  },
  "valerian": {
    "misrepresentedTokens": true,
    "methodology": "TVL is calculated by getting value of staked VAL using Arthswap DEX value of VAL.",
    "astar": {
      "tvl": { "__empty": true },
      "staking": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "owner": "0x99a2278ab93Ee6F590a87D8F37a16EE8f53F97Cc",
        "tokens": ["0xe1af4d744e2a66cd07c474bed167960be872fcd9"],
        "lps": ["0x56Ce6643eDD621EcD904d9b6C9e88745A125AF6d"]
      }
    }
  },
  "banano": {
    "methodology": "Pool2 TVL in Polygon and BSC LPs",
    "polygon": {
      "tvl": { "__empty": true },
      "pool2": { "resolveLP": true, "owner": "0xefa4aED9Cf41A8A0FcdA4e88EfA2F60675bAeC9F", "tokens": ["0xb556feD3B348634a9A010374C406824Ae93F0CF8"] }
    },
    "bsc": {
      "tvl": { "__empty": true },
      "pool2": { "resolveLP": true, "owner": "0x1E30E12e82956540bf870A40FD1215fC083a3751", "tokens": ["0xe20B9e246db5a0d21BF9209E4858Bc9A3ff7A034", "0x6011c6BAe36F2a2457dC69Dc49068a1E8Ad832DD", "0x7898466CACf92dF4a4e77a3b4d0170960E43b896", "0x351A295AfBAB020Bc7eedcB7fd5A823c01A95Fda", "0x76B1aB2f84bE3C4a103ef1d2C2a74145414FFA49"] }
    }
  },
  "treasury/dnadollar": {
    "cronos": {
      "tvl": { "__empty": true },
      "ownTokens": { "owners": ["0x1420287565FD5Ebec8FbD720c17Cd911600449d3"], "tokens": ["0xcc57f84637b441127f2f74905b9d99821b47b20c"] }
    }
  },
  "treasury/oceanus": {
    "metis": {
      "tvl": { "__empty": true },
      "ownTokens": { "owners": ["0xF29EEC2563b1E6a1ed87ff7DDfB164474d1Ecb50"], "tokens": ["0x41607272ce6f2a42732ae382f00f8f9ce68d78f3"] }
    }
  },
  "treasury/minswap": {
    "cardano": {
      "tvl": { "__empty": true },
      "ownTokens": { "owners": ["addr1z9wdv59sq7zzy2l6gchq3247lz7ssfsxs45nj4njhwsp5uzj2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pqzygnta", "addr1q8zntywq3fldecrqk4vl593sznvj7483ejcajnavvh2qpsvftaax5f3wasl5m49rtjw5pen938vr7863w0lfz94h0lfqldx3pu", "addr1qxymvaeg3306xyp6yk3mjdj7usp40x2e5cecsh75xw5tsczj2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pqjx0th5", "addr1q9gxe8vx0kvv5g6gv4n5wmsxexjqsjftc599qqcp2vkmmwh7snv5yhw2qqvdev3c7wn6s3xhrnx25eg6zcqjxj9vrv2s0e38ze", "addr1qx54hjkagnc7zanqkfjearg8nk2w303pgdyl2qm4hs2x8saxg62nrp8kp2mukmrr4pfyt4fpdyjp7dx8jxffs4gf2xcsx6uj7a"] }
    }
  },
  "treasury/wagmidao": {
    "methodology": "Counts liquidity on the Farms through Factory Contract, and counts Treasury as it is determined by bonding of assets. Staking refers to the staked GMI tokens",
    "harmony": { "tvl": { "__empty": true } }
  },
  "thorswap": {
    "methodology": "TVL is the total amount of THOR tokens staked in VTHOR, UTHOR, and YTHOR staking contracts",
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": {
        "owners": ["0x815C23eCA83261b6Ec689b60Cc4a58b54BC24D8D", "0x34deff97889f3a6a483e3b9255cafcb9a6e03588", "0x8793CD69895C45b2d2474236b3Cb28FC5C764775"],
        "tokens": ["0xa5f2211b9b8170f694421f2046281775e8468044"]
      }
    }
  },
  "themis-capital-ohm": {
    "misrepresentedTokens": true,
    "filecoin": {
      "tvl": { "__empty": true },
      "staking": {
        "__resolveUnknownTokenLP": true,
        "useDefaultCoreAssets": true,
        "owner": "0xA8a3136111ca0b010C9FD5C2D6d7c71e4982606A",
        "tokens": ["0x005E02A4A934142d8Dd476F192d0dD9c381b16b4"],
        "lps": ["0x45680718F6BdB7Ec3A7dF7D61587aC7C3fB49d50"]
      }
    }
  },
  "streme": {
    "methodology": "Staking tracks STREME tokens held in the primary staking/treasury contract on Base.",
    "start": 26098345,
    "base": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0x293A5d47f5D76244b715ce0D0e759E0227349486"], "tokens": ["0x3b3cd21242ba44e9865b066e5ef5d1cc1030cc58"] }
    }
  },
  "scarabfinance": {
    "fantom": {
      "tvl": { "__empty": true },
      "pool2": {
        "__resolveUnknownTokenLP": true,
        "owner": "0xc88690163b10521d5fB86c2ECB293261F7771525",
        "tokens": ["0x78e70eF4eE5cc72FC25A8bDA4519c45594CcD8d4", "0x27228140d72a7186f70ed3052c3318f2d55c404d"]
      },
      "staking": { "__staking": ["0xD00F41d49900d6affd707EC6a30d1Bf7D4B7dE8F", "0x6ab5660f0B1f174CFA84e9977c15645e4848F5D6"] }
    }
  },
  "satori": {
    "methodology": "Counts Satori smartcontract balance as TVL..",
    "polygon_zkevm": { "tvl": { "owners": ["0x62e724cB4d6C6C7317e2FADe4A03001Fe7856940", "0xA59a2365D555b24491B19A5093D3c99b119c2aBb"], "tokens": [ADDRESSES.astarzk.USDT, ADDRESSES.astarzk.MATIC] } },
    "era": { "tvl": { "owners": ["0x0842b33529516abe86CA8EA771aC4c84FDd0eeE0", "0x48756b37Fd643bB40F669804730024F02900C476"], "tokens": [ADDRESSES.era.USDC, ADDRESSES.era.ZK] } },
    "linea": { "tvl": { "owners": ["0xfb371E70eEB32f4054F40514924e77213ca18425", "0xF96116e124eB3F62Ddc6a9cfbdc58d7F8A37c50A"], "tokens": [ADDRESSES.linea.USDC, ADDRESSES.blast.ezETH] } },
    "scroll": { "tvl": { "owners": ["0xfb371E70eEB32f4054F40514924e77213ca18425", "0xF96116e124eB3F62Ddc6a9cfbdc58d7F8A37c50A"], "tokens": [ADDRESSES.scroll.USDC] } },
    "base": { "tvl": { "owners": ["0x668a9711b8d04362876dc5b6177ed362084d5aed", "0x5f075a6a11B2e25DF664Ce7419c274943017B595"], "tokens": [ADDRESSES.base.USDC, ADDRESSES.blast.ezETH, "0x23dA5F2d509cb43A59d43C108a43eDf34510eff1"] } },
    "xlayer": { "tvl": { "owners": ["0x80DD5bC934122e56B9536a9F19F2Ea95a38E98c8", "0xf915391346Fad5a75F31CD00218BB1EFC13e01f2"], "tokens": [ADDRESSES.xlayer.USDC] } },
    "arbitrum": { "tvl": { "owners": ["0x5aCCEb99De5cc07168C193396C1fdC3E3abEEED7", "0xAE9a83510cbB26c58595BA671f131e0A03Fe9A03"], "tokens": [ADDRESSES.arbitrum.USDC_CIRCLE] } },
    "ton": { "tvl": { "owners": ["EQDrGCJ3V8cMw92Gg8Tf9nfq3piaT_iI3EkCGVF0OUG0vWEh"], "tokens": [ADDRESSES.ton.USDT] } },
    "bsc": { "tvl": { "owners": ["0x3b6F3f7F0e3e8cCa7bC11dFA4a8567A6479Ece54", "0xD2F244164cd09e5cBb6360c4a17aAF976a34562a"], "tokens": [ADDRESSES.bsc.USDC, ADDRESSES.swellchain.stBTC] } },
    "zircuit": { "tvl": { "owners": ["0x301A29D92B23750c481D6F2feAA01F872561A528", "0x8DdCb1F874e635E03f172cc02B4F57ae94Ae7BC0"], "tokens": ["0x3b952c8C9C44e8Fe201e2b26F6B2200203214cfF", ADDRESSES.zircuit.WETH] } },
    "sty": { "tvl": { "owners": ["0x0848F4AE872545C901D3325AEFf09F0fa8952AfC", "0x133A54E116731c0CBE35EE41276D570e0730E92D"], "tokens": [ADDRESSES.flow.stgUSDC, "0x674843C06FF83502ddb4D37c2E09C01cdA38cbc8"] } },
    "plume": { "tvl": { "__empty": true } },
    "plume_mainnet": { "tvl": { "owners": ["0x04AE748272c3959A9904aeaD3cc00AAf476aa34D", "0x36Bd86676A05ABAaF30D57F65Ba463669E018F3e"], "tokens": [ADDRESSES.plume_mainnet.WPLUME, ADDRESSES.plume_mainnet.pUSD, ADDRESSES.plume_mainnet.USDC_e, ADDRESSES.plume_mainnet.USDT, "0xE72Fe64840F4EF80E3Ec73a1c749491b5c938CB9", "0x9fbC367B9Bb966a2A537989817A088AFCaFFDC4c"] } },
    "ethereum": { "tvl": { "owners": ["0x0857f8a6e41e1c71f4065daebfe7ddb825cbffde", "0xA394080628F175472Fee9eB316BD104fAB63FE40"], "tokens": [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.LBTC, ADDRESSES.swellchain.stBTC, "0xF469fBD2abcd6B9de8E169d128226C0Fc90a012e", ADDRESSES.ethereum.STETH, ADDRESSES.ethereum.WSTETH, ADDRESSES.ethereum.cbETH, ADDRESSES.ethereum.EETH, ADDRESSES.ethereum.RETH, ADDRESSES.bsc.wBETH, "0xa1290d69c65a6fe4df752f95823fae25cb99e5a7", "0xe95a203b1a91a908f9b9ce46459d101078c2c3cb", "0x09db87A538BD693E9d08544577d5cCfAA6373A48"] } }
  },
  "powerflow-bridge": {
    "methodology": "Counts the tokens locked in the PowerFlow Bridge contracts.",
    "titan": { "tvl": { "__empty": true } },
    "ethereum": {
      "tvl": {
        "owner": "0x9Be9C79f1d8bC09c5b9A6c312e360227Ddb57230",
        "tokens": [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT, ADDRESSES.null]
      }
    },
    "solana": {
      "tvl": {
        "owner": "Cqv9L3HeevzDQipST26xNR5DBrcRRRqRsg4HTHA1wE9L",
        "solOwners": ["Cqv9L3HeevzDQipST26xNR5DBrcRRRqRsg4HTHA1wE9L"]
      }
    }
  },
}
