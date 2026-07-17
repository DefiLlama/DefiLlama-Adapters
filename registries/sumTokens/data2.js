const ADDRESSES = require('../../projects/helper/coreAssets.json')

// Additional sumTokens registry configs, split out of registries/sumTokens.js / data1.js to keep files manageable.
// Same config shape as the `configs` object in sumTokens.js.
module.exports = {
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
}
