const ADDRESSES = require('../../projects/helper/coreAssets.json')

// Additional sumTokens registry configs, split out of registries/sumTokens.js to keep that file manageable.
// Same config shape as the `configs` object in sumTokens.js.
module.exports = {
  "parcl-v3": {
    "timetravel": false,
    "solana": { "tokenAccounts": ["Ai9AuTfGncuFxEknjZT4HU21Rkv98M1QyXpbW9Xct6LK"] }
  },
  "nirvana-v2": {
    "timetravel": false,
    "solana": { "tokenAccounts": ["FhTJEGXVwj4M6NQ1tPu9jgDZUXWQ9w2hP89ebZHwrJPS"] }
  },
  "asol": {
    "timetravel": false,
    "methodology": "aSOL TVL is computed by looking at the token balances of the accounts holding the stake pool tokens backing the aSOL Crate. The token accounts come from https://asol.so/#/admin.",
    "solana": {
      "tokenAccounts": [
        "4Bo98VrTYkHLbE9zoXx3tCD3qEDcGZFCZFksgyYPKdG9",
        "7n1AmrpywC84MdALohPBipAx1SYhjpSLjYFb2EuTV9wm"
      ]
    }
  },
  "dflow-prediction-market": {
    "solana": {
      "tokenAccounts": [
        "C6tLX41pT7ke9LtJ25cdhzPxVbngWD6KsDaEFTSC4SKE",
        "82TCjUf5YjrbJro4XdEfeCokvpQrNUntD97Zjrip8knr"
      ]
    }
  },
  "bulk-trade": {
    "timetravel": false,
    "methodology": "Counts USDC deposited into the Bulk Trade Season 1 pre-deposits.",
    "solana": { "tokenAccounts": ["HwdwwKH1tMXo7ggTKcA5cdQrpcgqSoVib2eQh3BiyEQL"] }
  },
  "stakenova": {
    "methodology": "TVL represents all user-deposited SOL plus unclaimed USDC rewards. Calculated by reading vault token balances directly on-chain.",
    "solana": {
      "tokenAccounts": [
        "7MBk8DXFnZCpKDiSwEMFwtyDNqxXMdUSgm52fQ3Chit4", // INF_VAULT
        "HVpnjWTJCDvHL2pL2LeE5Y3mLEE4hP4MwpZpBvBLHQuA" // USDC_VAULT
      ]
    }
  },
  "pokeliquid": {
    "timetravel": false,
    "methodology": "TVL is the sum of USDC deposited in the liquidity pool, fee vault (which holds user margin collateral), and insurance fund.",
    "solana": {
      "tokenAccounts": [
        "H1YCpzUXcoYFnek3Qc8VtekAe4gDTDNZZDVLwYuC9J1C", // LP Vault
        "BFm4z6Z2H84GrpcKkydmE1qZVidwuj2sP3N3wTNZemJt", // Fee Vault
        "266CZZpRb1PFDGQf4bNE5ASPVxAUkon6tv6BvRYpP7x9" // Insurance Fund
      ]
    }
  },
  "hylo": {
    "timetravel": false,
    "doublecounted": true,
    "methodology": "TVL is calculated by summing all LSTs locked in Hylo protocol.",
    "solana": {
      "tokenAccounts": [
        "2Y3TLkdGoJwbdizxqrZmQwNLYJyGKTgzC4tbetbkvQ43", // jitoSOL
        "7VNBQCDKt4cxLWW51suV8a6VAYC4R66CfyySiYJek7Rj" // hyloSOL
      ]
    }
  },
  "katana": {
    "timetravel": false,
    "solana": {
      "tokenAccounts": [
        "8vyTqVVPmJfqFexRcMBGDAHoSCyZ52RC5sRVhYzbfU4j",
        "7zJVLbx3DjjwkoD6eUGk4cgoBv2JR3RW67c3ff8URXYh",
        "2CD9R7K7AjAswjTJDmdf9HyUZQztfck1B22h9WUJeTeh",
        "377U1dX3mRd96BeoRkpmsJC67wnVDqTpi1u6dALkR9V5",
        "DUrVECpx5EkVW12eWvpjR8Xk2AgNS3epqEQ6p63SujQb",
        "6F5XPaeEiAwfmD5Rv9TAt4x7VhVaEU7qV9q6MSrvbozC",
        "6sSZcCfPaeKfGnTRXX3Ybd97eqVnYg1TLfytwArfUVz",
        "E2VKdRPvfMXBj3ePMbuZPRz1fwT7z7Gd9pnh8R3n25eW",
        "AV3pjicfiJQoR96mGT9byQLbUAXL2Zi1a74wis9Ezh5S",
        "5aJ5NzNmLfVLbqcbvYsW1e1GdEccrkFkLZwLWVLrmm4A",
        "2sKjWWYcdBmUQbdHBJXKbJBwHB2G9JB7mRnLYuEtgRcp"
      ]
    }
  },
  "kyros": {
    "timetravel": false,
    "doublecounted": true,
    "methodology": "The TVL is calculated by summing all restaked assets.",
    "solana": {
      "tvl": {
        "tokenAccounts": [
          "CRFtzwkekKorgdTRSdvsYeqL1vEuVvwGRvweuWCyaRt3", // jitoSOL @ kySOL Vault
          "HzwDsHJBtuSTRx3VV6bz1R8yrLywxKgfGte7FASXU8Gd" // JTO @ kyJTO Vault
        ]
      },
      "staking": {
        "tokenAccounts": ["Ct8QS77TMFF98gvN1ZXrNjGqUmdkJQACi5Xi2sCTSC7D"] // KYROS @ kyKYROS Vault
      }
    }
  },
  "hubble": {
    "timetravel": false,
    "solana": {
      "tvl": {
        "owners": [
          "HZYHFagpyCqXuQjrSCN2jWrMHTVHPf9VWP79UGyvo95L", // collateralVaultAuthority
          "8WrqMitrgjzfqaPJ5PK6X3VT6B1Z8rDgQQny2aWwvJ8q" // psmVaultAuthority
        ]
      },
      "staking": {
        "tokensAndOwners": [
          ["HBB111SCo9jkCejsZfz8Ec8nH7T6THF8KEKSnvwT6XK6", "GbjqYShCb3LeyXuxkjLBGcmrWakqePPpMoHraQJcTtJJ"]
        ]
      }
    }
  },
  "boop-fun": {
    "solana": {
      "tvl": {
        "tokensAndOwners": [
          [ADDRESSES.solana.SOL, "GVVUi6DaocSEAp8ATnXFAPNF5irCWjCvmPCzoaGAf5eJ"]
        ]
      },
      "staking": {
        "tokenAccounts": ["BZgWzdxHqytYrn3EuvkozE1Hg38CD5ajjxBppRHuV1nQ"]
      }
    }
  },
  "death-fun": {
    "start": 1748022475,
    "methodology": "Death.fun TVL is the native ETH held in the Death.fun game contract, which serves as the house bankroll used to pay player cashouts. Direct bankroll deposits and owner withdrawals affect TVL because they change the contract balance, but they are treasury movements rather than game outcomes.",
    "abstract": {
      "owners": ["0x27EDd16eE56958fddCBA08947f12C43DDeC2B20C"],
      "tokens": [ADDRESSES.null]
    }
  },
  "meme-wallet": {
    "methodology": "counts the TVL of tokens created by meme factory",
    "start": "2024-12-10",
    "wc": {
      "owner": "0xda601604ecd1cb5f12e4522f1138d5419daf0ee0",
      "tokens": [ADDRESSES.wc.WLD]
    }
  },
  "tbtc": {
    "timetravel": false,
    "methodology": "BTC on btc chain",
    "ethereum": { "__empty": true },
    "bitcoin": { "__btcBook": "tBTC" }
  },
  "vishwa": {
    "bitcoin": { "__btcBook": "vishwa" },
    "sui": { "__empty": true }
  },
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
  "tornado": {
    "ethereum": {
      "tokensAndOwners": [
        // ETH: 0.1 / 1 / 10 / 100
        [ADDRESSES.null, "0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc"],
        [ADDRESSES.null, "0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936"],
        [ADDRESSES.null, "0x910cbd523d972eb0a6f4cae4618ad62622b39dbf"],
        [ADDRESSES.null, "0xa160cdab225685da1d56aa342ad8841c3b53f291"],
        // DAI
        [ADDRESSES.ethereum.DAI, "0xD4B88Df4D29F5CedD6857912842cff3b20C8Cfa3"],
        [ADDRESSES.ethereum.DAI, "0xFD8610d20aA15b7B2E3Be39B396a1bC3516c7144"],
        [ADDRESSES.ethereum.DAI, "0x07687e702b410Fa43f4cB4Af7FA097918ffD2730"],
        [ADDRESSES.ethereum.DAI, "0x23773E65ed146A459791799d01336DB287f25334"],
        // USDT
        [ADDRESSES.ethereum.USDT, "0x169AD27A470D064DEDE56a2D3ff727986b15D52B"],
        [ADDRESSES.ethereum.USDT, "0x0836222F2B2B24A3F36f98668Ed8F0B38D1a872f"],
        [ADDRESSES.ethereum.USDT, "0xF67721A2D8F736E75a49FdD7FAd2e31D8676542a"],
        [ADDRESSES.ethereum.USDT, "0x9AD122c22B14202B4490eDAf288FDb3C7cb3ff5E"],
        // USDC
        [ADDRESSES.ethereum.USDC, "0xd96f2B1c14Db8458374d9Aca76E26c3D18364307"],
        [ADDRESSES.ethereum.USDC, "0x4736dCf1b7A3d580672CcE6E7c65cd5cc9cFBa9D"],
        [ADDRESSES.ethereum.USDC, "0xD691F27f38B395864Ea86CfC7253969B409c362d"],
        // WBTC
        [ADDRESSES.ethereum.WBTC, "0x178169B423a011fff22B9e3F3abeA13414dDD0F1"],
        [ADDRESSES.ethereum.WBTC, "0x610B717796ad172B316836AC95a2ffad065CeaB4"],
        [ADDRESSES.ethereum.WBTC, "0xbB93e510BbCD0B7beb5A853875f9eC60275CF498"],
        // cDAI
        ["0x5d3a536e4d6dbd6114cc1ead35777bab948e3643", "0x22aaA7720ddd5388A3c0A3333430953C68f1849b"],
        ["0x5d3a536e4d6dbd6114cc1ead35777bab948e3643", "0x03893a7c7463AE47D46bc7f091665f1893656003"],
        ["0x5d3a536e4d6dbd6114cc1ead35777bab948e3643", "0x2717c5e28cf931547B621a5dddb772Ab6A35B701"],
        ["0x5d3a536e4d6dbd6114cc1ead35777bab948e3643", "0xD21be7248e0197Ee08E0c20D4a96DEBdaC3D20Af"]
      ]
    },
    "bsc": {
      "owners": [
        "0x84443CFd09A48AF6eF360C6976C5392aC5023a1F", // 0.1 BNB
        "0xd47438C816c9E7f2E2888E060936a499Af9582b3", // 1 BNB
        "0x330bdFADE01eE9bF63C209Ee33102DD334618e0a", // 10 BNB
        "0x1E34A77868E19A6647b1f2F47B51ed72dEDE95DD" // 100 BNB
      ],
      "tokens": [ADDRESSES.null]
    },
    "polygon": {
      "owners": [
        "0x1E34A77868E19A6647b1f2F47B51ed72dEDE95DD", // 100
        "0xdf231d99Ff8b6c6CBF4E9B9a945CBAcEF9339178", // 1000
        "0xaf4c0B70B2Ea9FB7487C7CbB37aDa259579fe040", // 10000
        "0xa5C2254e4253490C54cef0a4347fddb8f75A4998" // 100000
      ],
      "tokens": [ADDRESSES.null]
    },
    "optimism": {
      "owners": [
        "0x84443CFd09A48AF6eF360C6976C5392aC5023a1F", // 0.1 ETH
        "0xd47438C816c9E7f2E2888E060936a499Af9582b3", // 1 ETH
        "0x330bdFADE01eE9bF63C209Ee33102DD334618e0a", // 10 ETH
        "0x1E34A77868E19A6647b1f2F47B51ed72dEDE95DD" // 100 ETH
      ],
      "tokens": [ADDRESSES.null]
    },
    "arbitrum": {
      "owners": [
        "0x84443CFd09A48AF6eF360C6976C5392aC5023a1F", // 0.1 ETH
        "0xd47438C816c9E7f2E2888E060936a499Af9582b3", // 1 ETH
        "0x330bdFADE01eE9bF63C209Ee33102DD334618e0a", // 10 ETH
        "0x1E34A77868E19A6647b1f2F47B51ed72dEDE95DD" // 100 ETH
      ],
      "tokens": [ADDRESSES.null]
    },
    "xdai": {
      "owners": [
        "0x1E34A77868E19A6647b1f2F47B51ed72dEDE95DD", // 100
        "0xdf231d99Ff8b6c6CBF4E9B9a945CBAcEF9339178", // 1000
        "0xaf4c0B70B2Ea9FB7487C7CbB37aDa259579fe040", // 10000
        "0xa5C2254e4253490C54cef0a4347fddb8f75A4998" // 100000
      ],
      "tokens": [ADDRESSES.null]
    },
    "avax": {
      "owners": [
        "0x330bdFADE01eE9bF63C209Ee33102DD334618e0a", // 10
        "0x1E34A77868E19A6647b1f2F47B51ed72dEDE95DD", // 100
        "0xaf8d1839c3c67cf571aa74B5c12398d4901147B3" // 500
      ],
      "tokens": [ADDRESSES.null]
    },
    "ethereumclassic": {
      "owners": [
        "0x2f56d5aFC058B8734350B162EFEe75ee48f034e0", // 1
        "0x59fCB629A23e8eD0a60A0188771E221042260118", // 10
        "0x784B3a7a7981B959bd8d9D9e73c2013BE819Fbf2" // 100
      ],
      "tokens": [ADDRESSES.null]
    }
  },
  "foom-cash": {
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": {
        "tokensAndOwners": [
          ["0xd0D56273290D339aaF1417D9bfa1bb8cFe8A0933", "0x239AF915abcD0a5DCB8566e863088423831951f8"] // FOOM
        ]
      }
    },
    "base": {
      "tvl": { "__empty": true },
      "staking": {
        "tokensAndOwners": [
          ["0x02300ac24838570012027e0a90d3feccef3c51d2", "0xdb203504ba1fea79164AF3CeFFBA88C59Ee8aAfD"] // FOOM
        ]
      }
    }
  },
  "privcash": {
    "kava": {
      "tokensAndOwners": [
        // KAVA: 100 / 1000 / 10000 / 100000 / 1000000
        [ADDRESSES.null, "0xCDFfa16631d2b6E78fE9Da3B0454EbF0d2edfFf3"],
        [ADDRESSES.null, "0xfe79e117875993da3c8332Be34B5F06A55c7d154"],
        [ADDRESSES.null, "0x8Bbd79F1E28006D2e7a6B7B29aa46E236F4DFE07"],
        [ADDRESSES.null, "0x29d9813881ADB448e9d94ae35a0015c996DB2d40"],
        [ADDRESSES.null, "0xD58b5EB926F2Ae88372Bb23C6D432932c705C53F"],
        // USDC: 10 / 100 / 1000 / 10000 / 100000
        ["0xfa9343c3897324496a05fc75abed6bac29f8a40f", "0xe4e992802314dbbd8BB9d050afae19ca1c45cB1A"],
        ["0xfa9343c3897324496a05fc75abed6bac29f8a40f", "0x8DFB4d1925cC8C7446AfA92f1cDd6c8be567Ae7C"],
        ["0xfa9343c3897324496a05fc75abed6bac29f8a40f", "0x00F5E31F0E33FBc23e723dCEd6C078fdD688D36a"],
        ["0xfa9343c3897324496a05fc75abed6bac29f8a40f", "0xCA0d7b385e9DC484C646C50F1BBA6B01CC60E361"],
        ["0xfa9343c3897324496a05fc75abed6bac29f8a40f", "0xc500DA72cCeA705aD5Ee3A4d77ABb1864DD30a4F"]
      ]
    }
  },
  "nsure": {
    "start": "2021-04-22",
    "ethereum": {
      "tokensAndOwners": [
        [ADDRESSES.ethereum.WETH, "0x1a66f065303299d78693f122c800Ab3dEbE9c966"], // stakePool
        [ADDRESSES.ethereum.WETH, "0x702aff99b08e8891fc70811174701fb7407b4477"], // buyPool
        [ADDRESSES.ethereum.WETH, "0x80e711b29e46d430ff1553eb2ada670e2a25593c"], // surplusPool
        [ADDRESSES.ethereum.WETH, "0xfd0D28539aeD12477dcba1575eB40fca53969440"], // treasuryPool
        ["0x20945ca1df56d237fd40036d47e866c7dccd2114", "0x1a66f065303299d78693f122c800Ab3dEbE9c966"],
        [ADDRESSES.null, "0xa6b658Ce4b1CDb4E7d8f97dFFB549B8688CAFb84"]
      ]
    }
  },
  "mirrosset": {
    "kava": {
      "tokensAndOwners": [
        ["0xfa9343c3897324496a05fc75abed6bac29f8a40f", "0x587Abb291379Ea84AcE583aB07A13109b9B3F347"], // USDC @ InsurancePool
        [ADDRESSES.null, "0xA6d5df932FFE35810389e00D1A3a698a44A14E85"] // KAVA @ MortgagePool
      ]
    }
  },
  "obsdn": {
    "methodology": "TVL is the total USDC deposited as collateral in the OBSDN contract.",
    "monad": {
      "tokensAndOwners": [
        [ADDRESSES.monad.USDC, "0x90c3747cd4E6bC6FbebB1b3C54D99737590eBE45"]
      ]
    }
  },
  "pingu": {
    "arbitrum": {
      "tvl": {
        "owners": ["0x7Cc41ee3Cba9a1D2C978c37A18A0d6b59c340224"],
        "tokens": [ADDRESSES.null, ADDRESSES.arbitrum.USDC_CIRCLE]
      },
      "staking": {
        "owners": ["0x7Cc41ee3Cba9a1D2C978c37A18A0d6b59c340224"],
        "tokens": ["0x83E60B9F7f4DB5cDb0877659b1740E73c662c55B"] // PINGU
      }
    },
    "monad": {
      "tvl": {
        "owners": ["0x576d51fB872065DC4Af6f83902fd4078eBCc2f03"],
        "tokens": [ADDRESSES.null, ADDRESSES.monad.USDC]
      },
      "staking": {
        "owners": ["0x576d51fB872065DC4Af6f83902fd4078eBCc2f03"],
        "tokens": ["0xA2426cD97583939E79Cfc12aC6E9121e37D0904d"] // PINGU
      }
    }
  },
  "rsk-bridge": {
    "bitcoin": { "__btcBook": "rskBridge" },
    "ethereum": {
      "owner": "0x12eD69359919Fc775bC2674860E8Fe2d2b6a7B5D",
      "fetchCoValentTokens": true,
      "logCalls": true
    },
    "rsk": {
      "owner": "0x9d11937E2179dC5270Aa86A3f8143232D6DA0E69",
      "tokens": [
        "0x44fcd0854d745EfdeF4Cfe9868efE4d4EB51eCD6",
        "0x70566D8541beaBe984c8BAbF8A816Ed908514Ba8",
        "0xFF9EA341d9ea91CB7c54342354377f5104Fd403f",
        "0x4991516DF6053121121274397A8C1DAD608bc95B",
        "0x1BDa44fda023F2af8280a16FD1b01D1A493BA6c4",
        "0x75c6e15702ebAcd51177154ff383DF9695E1B1DA",
        "0x9C3a5F8d686fadE293c0Ce989A62a34408C4e307",
        "0xe506F698B31a66049bD4653Ed934e7A07Cbc5549",
        "0x14ADAE34beF7Ca957ce2DDe5AdD97EA050123827",
        "0x73C08467E23F7DcB7DdbBc8d05041b74467A498A",
        "0x83cf9a58d31d9014f02ebe282d10c25C28E7De15",
        "0xB3D06103aF1A68026615e673D46047fAB77dB0Fa",
        "0xE700691Da7B9851F2F35f8b8182C69C53ccad9DB",
        "0xe0CFF8a40f540657c62EB4CAC34b915e5ed8d8FF",
        "0x6B1a73d547F4009A26B8485b63D7015D248AD406",
        "0x2aCc95758f8b5F583470bA265Eb685a8f45fC9D5"
      ],
      "logCalls": true,
      "permitFailure": true
    }
  },
  "northpole": {
    "methodology": "The cumulative market value of each vault collateral is TVL",
    "avax": {
      "owner": "0xBBe7bF1c422eFBb5B2cB7a91A6f0AA7CdE86C1d3",
      "tokens": [
        ADDRESSES.avax.WETH_e,
        ADDRESSES.avax.WBTC_e,
        ADDRESSES.avax.WAVAX,
        "0x321E7092a180BB43555132ec53AaA65a5bF84251"
      ]
    }
  },
  "standx": {
    "start": "2025-03-14",
    "methodology": "StandX TVL is calculated by aggregating the balances of bridged vault addresses on the respective chain. These vaults hold the underlying collateral for all DUSD bridged to the StandX ecosystem, representing the total value secured by the protocol.",
    "bsc": {
      "owners": [
        "0x11b660397382AE3A83c4Ad80e2F791189b39e433",
        "0x90bb5bdc6acd166237640c8707a694f1fc3aab84"
      ],
      "tokens": ["0xaf44A1E76F56eE12ADBB7ba8acD3CbD474888122"] // DUSD
    },
    "solana": {
      "tokenAccounts": [
        "5bGEXW6JkR3nHfFWdTYtr7AuVvgKEUF4MWcGW7wNza6M",
        "3GzZn1Qyzc6xzCgDn83teJysBW2bMCsK6DcRNhksMNo4"
      ]
    }
  },
  "wrappedBNB": {
    // deadFrom: "2024-12-12",  // migrated to bsc and alexar acting as the bridge now
    "timetravel": false,
    "methodology": "Counts the BNB held by the Kava BEP3 \"bnb\" deputy on BNB Beacon Chain, which backs the wrapped BNB minted on Kava.",
    "bsc": { "owners": ["bnb1jh7uv2rm6339yue8k4mj9406k3509kr4wt5nxn"] }
  },
  "wrappedfi": {
    "timetravel": false,
    "methodology": "The TVL consists of the underlying capital held in custody.",
    "ripple": { "owners": ["r4Pr9aBnqN84hbkmJo4HwUtLj63E5vGFyE"] },
    "celo": { "tokensAndOwners": [[ADDRESSES.null, "0x84d9dcAc2f00F2Cd903E340b5241EB6e5c198572"]] },
    "ethereum": { "tokensAndOwners": [[ADDRESSES.null, "0xD6873b9592AB601E6cE6a6A781799d54961942F3"]] }
  },
  "templar": {
    "bsc": {
      "tvl": { "__empty": true },
      "staking": {
        "owners": [
          "0xa1f61Ca61fe8655d2a204B518f6De964145a9324",
          "0xffC7B93b53BC5F4732b414295E989684702D0eb5"
        ],
        "tokens": ["0x19e6BfC1A6e4B042Fb20531244D47E252445df01"] // TEM
      }
    },
    "ethereum": { "tvl": { "__empty": true }, "staking": { "__empty": true } },
    "moonriver": { "tvl": { "__empty": true }, "staking": { "__empty": true } },
    "harmony": { "tvl": { "__empty": true }, "staking": { "__empty": true } }
  },
}
