const ADDRESSES = require('../../projects/helper/coreAssets.json')

// Additional sumTokens registry configs, split out of registries/sumTokens.js to keep that file manageable.
// Same config shape as the `configs` object in sumTokens.js.
module.exports = {
  "deversifi": {
    "methodology": "Counts the tokens on 0x5d22045daceab03b158031ecb7d9d06fad24609b and on rhino.fi cross-chain swap smart-wallet contracts",
    "ethereum": {
      "owner": "0x5d22045daceab03b158031ecb7d9d06fad24609b",
      "tokens": [
        ADDRESSES.null,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.DAI,
        "0xd26114cd6EE289AccF82350c8d8487fedB8A0C07",
        "0x940a2db1b7008b6c776d4faaca729d6d4a4aa551",
        ADDRESSES.ethereum.YFI,
        ADDRESSES.ethereum.MKR,
        ADDRESSES.ethereum.WBTC,
        "0xe41d2489571d322189246dafa5ebde1f4699f498",
        "0xcc80c051057b774cd75067dc48f8987c4eb97a5e",
        ADDRESSES.ethereum.USDC,
        "0x419d0d8bdd9af5e606ae2232ed285aff190e711b",
        "0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d",
        "0xba100000625a3754423978a60c9317c58a424e3d",
        ADDRESSES.ethereum.UNI,
        "0xc00e94cb662c3520282e6f5717214004a7f26888",
        "0xec67005c4e498ec7f55e092bd1d35cbc47c91892",
        ADDRESSES.ethereum.BAT,
        ADDRESSES.ethereum.LINK,
        ADDRESSES.ethereum.SNX,
        ADDRESSES.ethereum.AAVE,
        "0xeef9f339514298c6a857efcfc1a762af84438dee",
        "0xa117000000f279d81a1d3cc75430faa017fa5a2e",
        "0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b",
        "0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9",
        ADDRESSES.ethereum.LIDO,
        "0xdddddd4301a082e62e84e43f474f044423921918",
        "0xaaaebe6fe48e54f431b0c390cfaf0b017d09d42d",
        ADDRESSES.ethereum.MATIC,
        "0x0a0e3bfd5a8ce610e735d4469bc1b3b130402267",
        ADDRESSES.ethereum.INU,
        ADDRESSES.ethereum.CRV,
        "0x03ab458634910aad20ef5f1c8ee96f1d6ac54919",
        "0x0391d2021f89dc339f60fff84546ea23e337750f",
        ADDRESSES.ethereum.TOKE,
        "0x33349b282065b0284d756f0577fb39c158f935e6",
        "0x767fe9edc9e0df98e07454847909b5e959d7ca0e",
        "0x25f8087ead173b73d6e8b84329989a8eea16cf73",
        "0xdddd0e38d30dd29c683033fa0132f868597763ab",
        ADDRESSES.ethereum.WSTETH,
        ADDRESSES.ethereum.SUSHI
      ]
    },
    "arbitrum": {
      "owner": "0x10417734001162Ea139e8b044DFe28DbB8B28ad0",
      "tokens": [
        ADDRESSES.null,
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.optimism.DAI
      ]
    },
    "polygon": {
      "owners": [
        "0xBA4EEE20F434bC3908A0B18DA496348657133A7E",
        "0xda7EeB4049dA84596937127855B50271ad1687E7"
      ],
      "tokens": [
        ADDRESSES.null,
        ADDRESSES.polygon.USDC,
        ADDRESSES.polygon.USDT,
        ADDRESSES.polygon.DAI
      ]
    }
  },
  "allchainbridge": {
    "methodology": "Assets staked in the pool and trading contracts",
    "ethereum": {
      "owner": "0x92e929d8b2c8430bcaf4cd87654789578bb2b786",
      "tokens": [
        ADDRESSES.null,
        ADDRESSES.ethereum.BUSD,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.DAI,
        "0x0316EB71485b0Ab14103307bf65a021042c6d380",
        ADDRESSES.ethereum.WETH,
        "0x0bb217e40f8a5cb79adf04e1aab60e5abd0dfc1e",
        "0x6f259637dcd74c767781e37bc6133cd6a68aa161"
      ]
    },
    "bsc": {
      "owner": "0x1ed5685f345b2fa564ea4a670de1fde39e484751",
      "tokens": [
        ADDRESSES.null,
        ADDRESSES.bsc.BUSD,
        ADDRESSES.bsc.USDC,
        ADDRESSES.bsc.USDT,
        ADDRESSES.bsc.DAI,
        ADDRESSES.bsc.WBNB,
        ADDRESSES.bsc.BTCB,
        ADDRESSES.bsc.ETH,
        "0xe64e30276c2f826febd3784958d6da7b55dfbad3",
        "0xba2ae424d960c26247dd6c32edc70b295c744c43"
      ]
    },
    "heco": {
      "owner": "0xaeAE2CBb1E024E27e80cc61eE9A8B300282209B4",
      "tokens": [
        ADDRESSES.null,
        ADDRESSES.heco.USDC_HECO,
        ADDRESSES.heco.USDT,
        "0x0298c2b32eae4da002a15f36fdf7615bea3da047",
        "0x64ff637fb478863b7468bc97d30a5bf3a428a1fd",
        "0x329dda64Cbc4DFD5FA5072b447B3941CE054ebb3"
      ]
    },
    "okexchain": {
      "owner": "0x37809F06F0Daf8f1614e8a31076C9bbEF4992Ff9",
      "tokens": [
        ADDRESSES.null,
        ADDRESSES.okexchain.USDC,
        ADDRESSES.okexchain.USDT,
        ADDRESSES.okexchain.ETHK,
        ADDRESSES.okexchain.OKB
      ]
    },
    "polygon": {
      "owner": "0x242Ea2A8C4a3377A738ed8a0d8cC0Fe8B4D6C36E",
      "tokens": [
        ADDRESSES.null,
        ADDRESSES.polygon.USDC,
        ADDRESSES.polygon.USDT,
        ADDRESSES.polygon.WMATIC_2
      ]
    },
    "fantom": {
      "owner": "0x8f957ed3f969d7b6e5d6df81e61a5ff45f594dd1",
      "tokens": [
        ADDRESSES.null,
        "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
        "0x049d68029688eabf473097a2fc38ef61633a3c7a",
        "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
        "0x74b23882a30290451A17c44f4F05243b6b58C76d"
      ]
    },
    "kava": {
      "owner": "0xa62a9c5cC8B92E00AB269BcA9f5539617AA65863",
      "tokens": [
        ADDRESSES.null
      ]
    }
  },
  "whitewhale": {
    "hallmarks": [
      ["2022-05-07", "UST depeg"]
    ],
    "terra": {
      "owner": "terra1ec3r2esp9cqekqqvn0wd6nwrjslnwxm7fh8egy"
    }
  },
  "rainbow": {
    "timetravel": false,
    "ethereum": {
      "owner": "0x6BFaD42cFC4EfC96f529D786D643Ff4A8B89FA52",
      "fetchCoValentTokens": true,
      "logCalls": true
    },
    "near": {
      "owners": ["factory.bridge.near", "fast.bridge.near"],
      "tokens": [
        "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
        "aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near"
      ]
    }
  },
  "ngmizone": {
    "methodology": "Totals the $NTRN balance held by the NGMI.zone contract.",
    "neutron": {
      "owner": "neutron1xcjn7d2f6p2kjqdxtvm4dzeqay98hcmtts92uugw7efnz4zc05csyhhvq6",
      "tokens": ["untrn"]
    }
  },
  "kopi": {
    "kopi": {
      "owner": "kopi14t4jnhmjejj08x5w8f4t0r3lv820gvh85xw8np",
      "blacklistedTokens": [
        // excluding projects own tokens
        "ukopi",
        "ukusd"
      ]
    }
  },
  "extended": {
    "ethereum": {
      "owners": ["0x1cE5D7f52A8aBd23551e91248151CA5A13353C65"],
      "tokens": [ADDRESSES.ethereum.USDC]
    },
    "starknet": {
      "owners": [
        "0x062da0780fae50d68cecaa5a051606dc21217ba290969b302db4dd99d2e9b470",
        "0x060c0f8cdfa28e8a3f719d1e2def2599785d7557a5650794c150d9b557603e48"
      ],
      "tokens": [
        ADDRESSES.starknet.USDC,
        ADDRESSES.starknet.USDC_CIRCLE,
        ADDRESSES.starknet.WBTC,
        ADDRESSES.starknet.ETH,
        ADDRESSES.starknet.USDT
      ]
    }
  },
  "Duality": {
    "timetravel": false,
    "methodology": "TVL in Duality module.",
    "neutron": {
      "owner": "neutron1n58mly6f7er0zs6swtetqgfqs36jaarqlplf59"
    }
  },
  "dogeswap": {
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": {
        "tokensAndOwners": [
          ["0xb4FBed161bEbcb37afB1Cb4a6F7cA18b977cCB25", "0xd688F6223c11F601420d716d88d8C1AD018711B8"], // DOGES
          ["0xa9fb117df8d8a8e3db2f456078320548d6e107fa", "0x7a455859C5Bbe2a87c9c76FB684174B6cd31242E"]  // PUPPY
        ]
      }
    }
  },
  "calculated-finance": {
    "kujira": {
      "owner": "kujira1e6fjnq7q20sh9cca76wdkfg69esha5zn53jjewrtjgm4nktk824stzyysu"
    },
    "osmosis": {
      "owner": "osmo1zacxlu90sl6j2zf90uctpddhfmux84ryrw794ywnlcwx2zeh5a4q67qtc9"
    },
    "neutron": {
      "owner": "neutron1cc5adah6vekm2nz5yp6qs332g704q90jgc03v8zxpzaqh297jvqqae2eez"
    },
    "archway": {
      "owner": "archway1delmknshmvfuhv07uetes90crzrj32za23pgd9cvjtc5mrzfjauq3jqrpa"
    }
  },
  "keiko": {
    "methodology": "TVL consists of HYPE, wstHYPE, LHYPE, PURR and UBTC tokens deposited as collateral to mint KEI stablecoin in the protocol's vaults",
    "hyperliquid": {
      "owner": "0x67e70761E88C77ffF2174d5a4EaD42B44Df3F64a",
      "tokens": [
        ADDRESSES.hyperliquid.WHYPE, // HYPE
        ADDRESSES.hyperliquid.wstHYPE, // wstHYPE
        "0x5748ae796AE46A4F1348a1693de4b50560485562", // LHYPE
        "0x9b498C3c8A0b8CD8BA1D9851d40D186F1872b44E", // PURR
        "0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463" // UBTC
      ]
    }
  },
  "bridgekek": {
    "ethereum": {
      "owner": "0x53423b7bf445997e76ad94f820f0559e451a98e2",
      "tokens": ["0x67954768E721FAD0f0f21E33e874497C73ED6a82"],
      "logCalls": true
    },
    "kekchain": { "__empty": true }
  },
}
