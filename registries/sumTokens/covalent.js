const ADDRESSES = require('../../projects/helper/coreAssets.json')

// sumTokens registry configs that use the `fetchCoValentTokens` flag (CoValent token auto-discovery).
// Split out of registries/sumTokens.js. If a protocol has the flag on ANY chain, the whole protocol lives here.
// Same config shape as the `configs` object in sumTokens.js; merged in via Object.assign(configs, covalent).
module.exports = {
  "T2T2": {
    "ethereum": {
      "owner": "0xA875755b23a38E06B669219AFf9bb79845F43EFd",
      "fetchCoValentTokens": true,
      "blacklistedTokens": [
        "0x390e61f798267fe7aa9bbe61be8bb1776250d44c"
      ]
    },
    "base": {
      "owner": "0xE173A25C522385BB117b3044C79F534cD0a895EC",
      "tokens": [
        ADDRESSES.null
      ]
    },
  },
  "ancient8": {
    "ethereum": {
      "owners": [
        "0x12d4E64E1B46d27A00fe392653A894C1dd36fb80",
        "0x639F2AECE398Aa76b07e59eF6abe2cFe32bacb68"
      ],
      "fetchCoValentTokens": true
    },
  },
  "appchain": {
    "ethereum": {
      "owners": [
        "0x19df42E085e2c3fC4497172E412057F54D9f013E",
        "0x1c71201B43B45ACdF9AfD6A72817C0469F0dD274",
        "0xCdbbaC12527d6aB4d94bc524849c001574D88f65",
        "0xcE586d7e3920cAddf1dd2e5b5c94B2Cfe6118e1c",
        "0x8045B2aa6b823CbA8f99ef3D3404F711619d3473"
      ],
      "fetchCoValentTokens": true,
      "permitFailure": true
    },
  },
  "arbitrum": {
    "ethereum": {
      "owners": [
        "0xa3A7B6F88361F48403514059F1F16C8E78d60EeC",
        "0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a",
        "0xcEe284F754E854890e311e3280b767F80797180d",
        "0xA10c7CE4b876998858b1a9E12b10092229539400"
      ],
      "fetchCoValentTokens": true,
      "permitFailure": true
    },
  },
  "arbitrumNova": {
    "ethereum": {
      "owners": [
        "0xC1Ebd02f738644983b6C4B2d440b8e77DdE276Bd",
        "0x23122da8C581AA7E0d07A36Ff1f16F799650232f",
        "0xB2535b988dcE19f9D71dfB22dB6da744aCac21bf",
        "0xA2e996f0cb33575FA0E36e8f62fCd4a9b897aAd3"
      ],
      "fetchCoValentTokens": true,
      "blacklistedTokens": [
        "0xe3dbc4f88eaa632ddf9708732e2832eeaa6688ab"
      ]
    },
  },
  "base": {
    "ethereum": {
      "owners": [
        "0x3154Cf16ccdb4C6d922629664174b904d80F2C35",
        "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e"
      ],
      "fetchCoValentTokens": true
    },
  },
  "blackwing": {
    "arbitrum": {
      "tokens": [
        ADDRESSES.arbitrum.USDC_CIRCLE,
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.WETH,
        ADDRESSES.optimism.ezETH,
        ADDRESSES.arbitrum.weETH,
        "0xafd22f824d51fb7eed4778d303d4388ac644b026",
        "0x1c27ad8a19ba026adabd615f6bc77158130cfbe4",
        "0x8ea5040d423410f1fdc363379af88e1db5ea1c34"
      ],
      "owner": "0xc6aDE8A68026d582AB37B879D188caF7e405dD09",
      "fetchCoValentTokens": true
    },
    "ethereum": {
      "tokens": [
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WETH,
        "0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0",
        "0xa1290d69c65a6fe4df752f95823fae25cb99e5a7",
        ADDRESSES.linea.rzETH,
        ADDRESSES.ethereum.EETH,
        ADDRESSES.ethereum.WEETH,
        ADDRESSES.ethereum.sUSDe,
        "0x5cb12D56F5346a016DBBA8CA90635d82e6D1bcEa",
        "0xf7906f274c174a52d444175729e3fa98f9bde285",
        "0xb05cabcd99cf9a73b19805edefc5f67ca5d1895e",
        "0xa0021ef8970104c2d008f38d92f115ad56a9b8e1",
        "0x9946c55a34cd105f1e0cf815025eaecff7356487",
        "0x5cb12d56f5346a016dbba8ca90635d82e6d1bcea",
        "0xd810362556296c834e30c9a61d8e21a5cf29eab4",
        "0x6ee2b5e19ecba773a352e5b21415dc419a700d1d",
        "0xc69ad9bab1dee23f4605a82b3354f8e40d1e5966",
        ADDRESSES.ethereum.INU,
        "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
        "0x18f313Fc6Afc9b5FD6f0908c1b3D476E3feA1DD9",
        "0xD9A442856C234a39a81a089C06451EBAa4306a72",
        "0x49446A0874197839D15395B908328a74ccc96Bc0",
        "0x9Ba021B0a9b958B5E75cE9f6dff97C7eE52cb3E6",
        "0x32bd822d615A3658A68b6fDD30c2fcb2C996D678"
      ],
      "owner": "0xc6aDE8A68026d582AB37B879D188caF7e405dD09",
      "fetchCoValentTokens": true
    },
    "bsc": {
      "tokens": [
        ADDRESSES.bsc.USDT,
        ADDRESSES.bsc.WBNB
      ],
      "owner": "0xD00789260984160a64DcF19A03896DfF73BF4514",
      "fetchCoValentTokens": true
    },
  },
  "bob": {
    "ethereum": {
      "tokens": [
        ADDRESSES.null,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.tBTC,
        ADDRESSES.ethereum.RETH,
        ADDRESSES.ethereum.WSTETH,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.WETH,
        "0x7122985656e38BDC0302Db86685bb972b145bD3C",
        "0xbdBb63F938c8961AF31eaD3deBa5C96e6A323DD1",
        "0xbdab72602e9AD40FC6a6852CAf43258113B8F7a5",
        "0xe7c3755482d0dA522678Af05945062d4427e0923",
        ADDRESSES.ethereum.LBTC
      ],
      "owners": [
        "0x3F6cE1b36e5120BBc59D0cFe8A5aC8b6464ac1f7",
        "0x091dF5E1284E49fA682407096aD34cfD42B95B72",
        "0x450D55a4B4136805B0e5A6BB59377c71FC4FaCBb",
        "0x8AdeE124447435fE03e3CD24dF3f4cAE32E65a3E"
      ],
      "fetchCoValentTokens": true
    },
  },
  "boba": {
    "ethereum": {
      "owners": [
        "0xdc1664458d2f0B6090bEa60A8793A4E66c2F1c00",
        "0x1A26ef6575B7BBB864d984D9255C069F6c361a14"
      ],
      "fetchCoValentTokens": true
    },
  },
  "cables": {
    "avax": {
      "owners": [
        "0xfA12DCB2e1FD72bD92E8255Db6A781b2c76adC20"
      ],
      "fetchCoValentTokens": true
    },
    "arbitrum": {
      "owners": [
        "0xfA12DCB2e1FD72bD92E8255Db6A781b2c76adC20"
      ],
      "fetchCoValentTokens": true
    },
  },
  "conduit-bridge": {
    "ethereum": {
      "owners": [
        "0xbaedb5b6da67f96b4125f17dd92f618696494bd3",
        "0x14ea6add7fa61001bd2e38100bfdf2cd710e44d9"
      ],
      "fetchCoValentTokens": true
    },
  },
  "core-bridge": {
    "ethereum": {
      "owners": [
        "0x52e75D318cFB31f9A2EdFa2DFee26B161255B233",
        "0x4D73AdB72bC3DD368966edD0f0b2148401A178E2"
      ],
      "fetchCoValentTokens": true,
      "permitFailure": true
    },
    "bsc": {
      "owners": [
        "0x52e75D318cFB31f9A2EdFa2DFee26B161255B233",
        "0x4D73AdB72bC3DD368966edD0f0b2148401A178E2"
      ],
      "fetchCoValentTokens": true,
      "permitFailure": true
    },
    "polygon": {
      "owners": [
        "0x52e75D318cFB31f9A2EdFa2DFee26B161255B233",
        "0x4D73AdB72bC3DD368966edD0f0b2148401A178E2"
      ],
      "fetchCoValentTokens": true,
      "permitFailure": true
    },
    "optimism": {
      "owner": "0x29d096cD18C0dA7500295f082da73316d704031A",
      "fetchCoValentTokens": true,
      "permitFailure": true
    },
    "avax": {
      "owner": "0x29d096cD18C0dA7500295f082da73316d704031A",
      "fetchCoValentTokens": true,
      "permitFailure": true
    },
    "arbitrum": {
      "owner": "0x29d096cD18C0dA7500295f082da73316d704031A",
      "fetchCoValentTokens": true,
      "permitFailure": true
    },
    "base": {
      "owner": "0x84FB2086Fed7b3c9b3a4Bc559f60fFaA91507879",
      "fetchCoValentTokens": true,
      "permitFailure": true
    },
  },
  "corn-l2": {
    "ethereum": {
      "owners": [
        "0x8bc93498b861fd98277c3b51d240e7e56e48f23c",
        "0x6d85d1c7f58fd5d05b1b633e8b0ce2e57fca9d80"
      ],
      "fetchCoValentTokens": true,
      "permitFailure": true
    },
  },
  "cyber": {
    "ethereum": {
      "owners": [
        "0x12a580c05466eefb2c467C6b115844cDaF55B255",
        "0x1d59bc9fcE6B8E2B1bf86D4777289FFd83D24C99"
      ],
      "fetchCoValentTokens": true
    },
  },
  "cyclo": {
    "methodology": "Total value locked in Cyclo vaults.",
    "flare": {
      "tokensAndOwners": [
        [
          "0x12e605bc104e93B45e1aD99F9e555f659051c2BB",
          "0x19831cfB53A0dbeAD9866C43557C1D48DfF76567"
        ],
        [
          "0x1502FA4be69d526124D453619276FacCab275d3D",
          "0xd8BF1d2720E9fFD01a2F9A2eFc3E101a05B852b4"
        ]
      ],
      "fetchCoValentTokens": true,
      "permitFailure": true
    },
  },
  "degen-bridge": {
    "base": {
      "owner": "0xEfEf4558802bF373Ce3307189C79a9cAb0a4Cb9C",
      "fetchCoValentTokens": true
    },
  },
  "derivadex": {
    "start": "2020-12-05",
    "ethereum": {
      "owner": "0x6fb8aa6fc6f27e591423009194529ae126660027",
      "fetchCoValentTokens": true,
      "tokens": [
        "0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9"
      ]
    },
  },
  "eclipse-bridge": {
    "ethereum": {
      "owner": "0xd7e4b67e735733ac98a88f13d087d8aac670e644",
      "fetchCoValentTokens": true,
      "permitFailure": true
    },
  },
  "ekubo-evm": {
    "ethereum": {
      "owners": [
        "0xe0e0e08a6a4b9dc7bd67bcb7aade5cf48157d444"
      ],
      "fetchCoValentTokens": true,
      "tokenConfig": {
        "onlyWhitelisted": false
      }
    },
  },
  "enibridge": {
    "methodology": "TVL is calculated by summing the total value of all tokens locked in the protocol’s smart contracts on the source chains.",
    "ethereum": {
      "owner": "0x34F64B5E7FBC9C04Fe8F361bd73B5cde5AFe28B7",
      "fetchCoValentTokens": true
    },
  },
  "enso-finance": {
    "methodology": "Get the list of whitelisted index tokens from accepted adapters - TokenSet IndexCoop Indexed PowerPool and PieDAO - and query the amounts held by the vampire LiquidityMigrationV2 contract",
    "ethereum": {
      "owner": "0x0c6D898ac945E493D25751Ea43BE2c8Beb881D8C",
      "fetchCoValentTokens": true,
      "tokens": [
        "0x0327112423f3a68efdf1fcf402f6c5cb9f7c33fd",
        "0x126c121f99e1e211df2e5f8de2d96fa36647c855",
        "0x7b18913d945242a9c313573e6c99064cd940c6af",
        "0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c",
        "0xe5feeac09d36b18b3fa757e5cf3f8da6b8e27f4c"
      ]
    },
  },
  "eventum": {
    "arbitrum": {
      "owners": [
        "0x8D21dfEA9231Db85dCe72b8d9F18e917d833d4B1",
        "0xAD3026961087eccEC0508D411bb9fb405E086B38"
      ],
      "fetchCoValentTokens": true
    },
  },
  "flooring-io": {
    "ethereum": {
      "tvl": {
        "owner": "0x3eb879cc9a0Ef4C6f1d870A40ae187768c278Da2",
        "tokens": [
          "0xb6a37b5d14d502c3ab0ae6f3a0e058bc9517786e",
          "0xfd1b0b0dfa524e1fd42e7d51155a663c581bbd50",
          "0xbd3531da5cf5857e7cfaa92426877b022e612cf8",
          "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"
        ],
        "fetchCoValentTokens": true,
        "resolveNFTs": true,
        "blacklistedTokens": [
          "0x102c776DDB30C754dEd4fDcC77A19230A60D4e4f",
          "0x9b947Cc819b00AF2e377C025C3f386fbf3C0055c"
        ]
      },
      "staking": {
        "owner": "0x3eb879cc9a0Ef4C6f1d870A40ae187768c278Da2",
        "tokens": [
          "0x102c776DDB30C754dEd4fDcC77A19230A60D4e4f"
        ]
      }
    },
  },
  "form-l2": {
    "ethereum": {
      "owners": [
        "0x4e259ee5f4136408908160dd32295a5031fa426f"
      ],
      "fetchCoValentTokens": true
    },
  },
  "fraxtal": {
    "ethereum": {
      "owners": [
        "0x34C0bD5877A5Ee7099D0f5688D65F4bB9158BDE2",
        "0x36cb65c1967A0Fb0EEE11569C51C2f2aA1Ca6f6D"
      ],
      "fetchCoValentTokens": true
    },
  },
  "fuel": {
    "ethereum": {
      "owners": [
        "0xAEB0c00D0125A8a788956ade4f4F12Ead9f65DDf",
        "0xa4cA04d02bfdC3A2DF56B9b6994520E69dF43F67"
      ],
      "fetchCoValentTokens": true
    },
  },
  "gasp-xyz": {
    "ethereum": {
      "owner": "0x79d968d9017B96f202aD4673A2c1BBbdc905A4ca",
      "fetchCoValentTokens": true
    },
    "arbitrum": {
      "owner": "0x3aDdEb54ddd43Eb40235eC32DfA7928F28A44bb5",
      "fetchCoValentTokens": true
    },
    "base": {
      "owner": "0x308e483afDD225D6cb7bF4d44B8e4a03DFD9c0De",
      "fetchCoValentTokens": true
    },
  },
  "gravity": {
    "ethereum": {
      "owners": [
        "0x7983403dDA368AA7d67145a9b81c5c517F364c42"
      ],
      "fetchCoValentTokens": true
    },
  },
  "hemi-l2": {
    "ethereum": {
      "owners": [
        "0x5eaa10F99e7e6D177eF9F74E519E319aa49f191e",
        "0x39a0005415256B9863aFE2d55Edcf75ECc3A4D7e"
      ],
      "fetchCoValentTokens": true,
      "blacklistedTokens": [
        "0xeb964a1a6fab73b8c72a0d15c7337fa4804f484d"
      ]
    },
  },
  "hemi-locked": {
    "ethereum": {
      "owners": [
        "0x5eaa10F99e7e6D177eF9F74E519E319aa49f191e",
        "0x39a0005415256B9863aFE2d55Edcf75ECc3A4D7e"
      ],
      "fetchCoValentTokens": true,
      "blacklistedTokens": [
        "0xeb964a1a6fab73b8c72a0d15c7337fa4804f484d"
      ]
    },
  },
  "immutable-zkevm": {
    "ethereum": {
      "owner": "0xBa5E35E26Ae59c7aea6F029B68c6460De2d13eB6",
      "fetchCoValentTokens": true
    },
  },
  "injective": {
    "methodology": "TVL accounts for all liquidity on the Injective chain, using the chain's bank module as the source.",
    "ethereum": {
      "owner": "0xf955c57f9ea9dc8781965feae0b6a2ace2bad6f3",
      "fetchCoValentTokens": true,
      "blacklistedTokens": [
        "0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30"
      ],
      "logCalls": true
    },
  },
  "ink": {
    "ethereum": {
      "owners": [
        "0xbd4AbB321138e8Eddc399cE64E66451294325a14",
        "0x88FF1e5b602916615391F55854588EFcBB7663f0",
        "0x5d66C1782664115999C47c9fA5cd031f495D3e4F"
      ],
      "fetchCoValentTokens": true
    },
  },
  "karak_chain": {
    "ethereum": {
      "owners": [
        "0xBA61F25dd9f2d5f02D01B1C2c1c5F0B14c4B48A3",
        "0xeeCE9CD7Abd1CC84d9dfc7493e7e68079E47eA73"
      ],
      "fetchCoValentTokens": true
    },
  },
  "kroma": {
    "ethereum": {
      "owners": [
        "0x827962404D7104202C5aaa6b929115C8211d9596",
        "0x31F648572b67e60Ec6eb8E197E1848CC5F5558de",
        "0x7e1Bdb9ee75B6ef1BCAAE3B1De1c616C7B11ef6e"
      ],
      "fetchCoValentTokens": true
    },
  },
  "linea": {
    "ethereum": {
      "owners": [
        "0xd19d4B5d358258f05D7B411E21A1460D11B0876F",
        "0x051F1D88f0aF5763fB888eC4378b4D8B29ea3319"
      ],
      "fetchCoValentTokens": true
    },
  },
  "lisk-l2": {
    "ethereum": {
      "owners": [
        "0x2658723bf70c7667de6b25f99fcce13a16d25d08",
        "0x26dB93F8b8b4f7016240af62F7730979d353f9A7"
      ],
      "tokens": [
        ADDRESSES.null
      ],
      "fetchCoValentTokens": true
    },
  },
  "manta-pacific": {
    "ethereum": {
      "owners": [
        "0x3b95bc951ee0f553ba487327278cac44f29715e5",
        "0x9168765EE952de7C6f8fC6FaD5Ec209B960b7622"
      ],
      "fetchCoValentTokens": true
    },
  },
  "mantle": {
    "ethereum": {
      "owners": [
        "0x95fC37A27a2f68e3A647CDc081F0A89bb47c3012"
      ],
      "fetchCoValentTokens": true
    },
  },
  "megaeth-bridge": {
    "ethereum": {
      "owners": [
        "0x7f82f57F0Dd546519324392e408b01fcC7D709e8",
        "0x0ca3a2fbc3d770b578223fbb6b062fa875a2ee75"
      ],
      "fetchCoValentTokens": true,
      "permitFailure": true
    },
  },
  "metis": {
    "ethereum": {
      "owner": "0x3980c9ed79d2c191A89E02Fa3529C60eD6e9c04b",
      "fetchCoValentTokens": true
    },
  },
  "metisBridge": {
    "ethereum": {
      "owner": "0x3980c9ed79d2c191A89E02Fa3529C60eD6e9c04b",
      "fetchCoValentTokens": true
    },
  },
  "mint-chain": {
    "ethereum": {
      "owners": [
        "0x2b3F201543adF73160bA42E1a5b7750024F30420",
        "0x59625d1FE0Eeb8114a4d13c863978F39b3471781"
      ],
      "fetchCoValentTokens": true,
      "permitFailure": true
    },
  },
  "mode": {
    "ethereum": {
      "owners": [
        "0x8B34b14c7c7123459Cf3076b8Cb929BE097d0C07",
        "0x735aDBbE72226BD52e818E7181953f42E3b0FF21"
      ],
      "fetchCoValentTokens": true
    },
  },
  "mxczkevm": {
    "arbitrum": {
      "owners": [
        "0x4C3924E619E2eE83cFD565c1432cb621ca8af7A0",
        "0x3160284BC2F4d7F5b170C70a0Ee0bC5333c7F39e"
      ],
      "tokens": [
        "0x0f813f4785b2360009f9ac9bf6121a85f109efc6",
        "0x12e96c2bfea6e835cf8dd38a5834fa61cf723736"
      ],
      "fetchCoValentTokens": true
    },
  },
  "nata": {
    "polygon": {
      "tokens": [
        ADDRESSES.polygon.WETH_1,
        ADDRESSES.polygon.DAI,
        "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8",
        "0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE",
        ADDRESSES.polygon.aPolWMATIC
      ],
      "resolveUniV3": true,
      "fetchCoValentTokens": true,
      "owner": "0x03ebC6d159C41419747354bc819dF274Da9948B5"
    },
  },
  "nocturne_xyz": {
    "hallmarks": [
      [
        "2024-01-22",
        "Nocturne V1 is being sunset"
      ]
    ],
    "ethereum": {
      "owners": [
        "0xA561492dFC1A90418Cc8b9577204d56C17CB32Ff",
        "0x33ab3ceC16B6640945E669a86C897A8e03f019CD",
        "0x1B33B8499EB6D681CDcF19c79dF8A3Dec9c652C3"
      ],
      "fetchCoValentTokens": true
    },
  },
  "orderly": {
    "ethereum": {
      "owners": [
        "0xe07eA0436100918F157DF35D01dCE5c11b16D1F1",
        "0x91493a61ab83b62943E6dCAa5475Dd330704Cc84"
      ],
      "fetchCoValentTokens": true
    },
  },
  "orion-rfq": {
    "ethereum": {
      "owner": "0xb5599f568D3f3e6113B286d010d2BCa40A7745AA",
      "fetchCoValentTokens": true,
      "blacklistedTokens": [
        "0x0258F474786DdFd37ABCE6df6BBb1Dd5dfC4434a"
      ]
    },
    "bsc": {
      "owner": "0xe9d1D2a27458378Dd6C6F0b2c390807AEd2217Ca",
      "fetchCoValentTokens": true
    },
    "fantom": {
      "owner": "0x9dB0Af2fc2BB5144204533d3e0bc8Ed14C8C4923",
      "fetchCoValentTokens": true,
      "blacklistedTokens": [
        "0xD2cDcB6BdEE6f78DE7988a6A60d13F6eF0b576D9"
      ]
    },
    "polygon": {
      "owner": "0x7B52881fA99c752cf8FbfD4904091d0FCCF7e71a",
      "fetchCoValentTokens": true,
      "blacklistedTokens": [
        "0xD2cDcB6BdEE6f78DE7988a6A60d13F6eF0b576D9"
      ]
    },
  },
  "pepu-bridge": {
    "ethereum": {
      "owners": [
        "0xd3643255ea784c75a5325cc5a4a549c7cd62e499",
        "0x7c2838461fa468896a06ca1e7d88bdece1f2e1be"
      ],
      "fetchCoValentTokens": true
    },
  },
  "polygon": {
    "start": "2020-05-30",
    "ethereum": {
      owners: [
        '0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf',
        '0x8484Ef722627bf18ca5Ae6BcF031c23E6e922B30',
        '0x401F6c983eA34274ec46f84D70b31C151321188b',
        '0x5e3Ef299fDDf15eAa0432E6e66473ace8c13D908',
      ],
      tokens: [
        ADDRESSES.null,
        ADDRESSES.ethereum.MATIC,
      ],
      "blacklistedTokens": [
        "0x99fe3b1391503a1bc1788051347a1324bff41452"
      ],
      fetchCoValentTokens: true,
      permitFailure: true,
    },
  },
  "polygonZk": {
    "ethereum": {
      "owner": "0x2a3DD3EB832aF982ec71669E178424b10Dca2EDe",
      "fetchCoValentTokens": true
    },
  },
  "pulsechain": {
    "ethereum": {
      "owner": "0x1715a3E4A142d8b698131108995174F37aEBA10D",
      "fetchCoValentTokens": true,
      "permitFailure": true
    },
  },
  "pulsechain-bridge": {
    "ethereum": {
      "owner": "0x1715a3E4A142d8b698131108995174F37aEBA10D",
      "fetchCoValentTokens": true
    },
  },
  "rari_chain": {
    "arbitrum": {
      "owners": [
        "0x255f80Ef2F09FCE0944faBb292b8510F01316Cf0",
        "0x8bE956aB42274056ef4471BEb211b33e258b7324",
        "0x46406c88285AD9BE2fB23D9aD96Cb578d824cAb6"
      ],
      "fetchCoValentTokens": true
    },
  },
  "redstone": {
    "ethereum": {
      "owners": [
        "0xc473ca7E02af24c129c2eEf51F2aDf0411c1Df69",
        "0xC7bCb0e8839a28A1cFadd1CF716de9016CdA51ae"
      ],
      "fetchCoValentTokens": true
    },
  },
  "renegade-fi": {
    "arbitrum": {
      "owners": [
        "0x30bD8eAb29181F790D7e495786d4B96d7AfDC518"
      ],
      "fetchCoValentTokens": true
    },
    "base": {
      "owners": [
        "0xb4a96068577141749CC8859f586fE29016C935dB"
      ],
      "fetchCoValentTokens": true
    },
  },
  "rise": {
    "ethereum": {
      "owners": [
        "0xad92Fa18EB74E46Db844240623124BF46589db4C"
      ],
      "fetchCoValentTokens": true
    },
  },
  "ronin-bridge": {
    "ethereum": {
      "owner": "0x64192819Ac13Ef72bF6b5AE239AC672B43a9AF08",
      "fetchCoValentTokens": true
    },
  },
  "rss3": {
    "ethereum": {
      "owners": [
        "0x4cbab69108Aa72151EDa5A3c164eA86845f18438"
      ],
      "fetchCoValentTokens": true
    },
  },
  "sanko-bridge": {
    "arbitrum": {
      "owners": [
        "0x2f285781B8d58678a3483de52D618198E4d27532",
        "0xb4951c0C41CFceB0D195A95FE66280457A80a990"
      ],
      "fetchCoValentTokens": true
    },
  },
  "scroll": {
    "ethereum": {
      "owners": [
        "0xD8A791fE2bE73eb6E6cF1eb0cb3F36adC9B3F8f9",
        "0xb2b10a289A229415a124EFDeF310C10cb004B6ff",
        "0x7F2b8C31F88B6006c382775eea88297Ec1e3E905",
        "0x6774Bcbd5ceCeF1336b5300fb5186a12DDD8b367",
        "0xb94f7F6ABcb811c5Ac709dE14E37590fcCd975B6",
        "0x6260aF48e8948617b8FA17F4e5CEa2d21D21554B",
        "0xf1AF3b23DE0A5Ca3CAb7261cb0061C0D779A5c7B",
        "0x6625C6332c9F91F2D27c304E729B86db87A3f504"
      ],
      "fetchCoValentTokens": true
    },
  },
  "shape": {
    "ethereum": {
      "owners": [
        "0x62Edd5f4930Ea92dCa3fB81689bDD9b9d076b57B",
        "0xEB06fFa16011B5628BaB98E29776361c83741dd3"
      ],
      "fetchCoValentTokens": true
    },
  },
  "soneium": {
    "ethereum": {
      "owners": [
        "0xeb9bf100225c214Efc3E7C651ebbaDcF85177607",
        "0x88e529a6ccd302c948689cd5156c83d4614fae92"
      ],
      "fetchCoValentTokens": true
    },
  },
  "soon": {
    "ethereum": {
      "owners": [
        "0x5a0702c7ebbec83802b35db737fccdc5fc6c5e07",
        "0xe822c3d76ac133f7d9f12c39c1bf28a797624aa9"
      ],
      "fetchCoValentTokens": true,
      "permitFailure": true
    },
  },
  "sorare": {
    "ethereum": {
      "owners": [
        "0xF5C9F957705bea56a7e806943f98F7777B995826"
      ],
      "fetchCoValentTokens": true
    },
  },
  "sovryn-bridge": {
    "ethereum": {
      "owner": "0x33C0D33a0d4312562ad622F91d12B0AC47366EE1",
      "fetchCoValentTokens": true,
      "logCalls": true
    },
    "bsc": {
      "owner": "0xdfc7127593c8Af1a17146893F10e08528F4C2AA7",
      "fetchCoValentTokens": true,
      "logCalls": true
    },
  },
  "stobix": {
    "base": {
      "owners": [
        "0x8283E74dA050F6eE93991Dfb0D823e35515Da8E8"
      ],
      "fetchCoValentTokens": true
    },
  },
  "suibridge": {
    "ethereum": {
      "owner": "0x312e67b47A2A29AE200184949093D92369F80B53",
      "fetchCoValentTokens": true,
      "permitFailure": true
    },
  },
  "supra-bridge": {
    "ethereum": {
      "owners": [
        "0xf530214106d443cde08a858e9c7e057048edb5a6"
      ],
      "fetchCoValentTokens": true,
      "permitFailure": true
    },
  },
  "swellchain": {
    "ethereum": {
      "owners": [
        "0x7aA4960908B13D104bf056B23E2C76B43c5AACc8",
        "0x758E0EE66102816F5C3Ec9ECc1188860fbb87812",
        "0xecf3376512EDAcA4FBB63d2c67d12a0397d24121"
      ],
      "fetchCoValentTokens": true
    },
  },
  "sxr-bridge": {
    "ethereum": {
      "tvl": {
        "owners": [
          "0xa104C0426e95a5538e89131DbB4163d230C35f86",
          "0xB4968C66BECc8fb4f73b50354301c1aDb2Abaa91"
        ],
        "blacklistedTokens": [
          "0xbe9f61555f50dd6167f2772e9cf7519790d96624",
          "0x99fe3b1391503a1bc1788051347a1324bff41452"
        ],
        "fetchCoValentTokens": true
      },
      "staking": {
        "owners": [
          "0xa104C0426e95a5538e89131DbB4163d230C35f86",
          "0xB4968C66BECc8fb4f73b50354301c1aDb2Abaa91"
        ],
        "tokens": [
          "0xbe9f61555f50dd6167f2772e9cf7519790d96624",
          "0x99fe3b1391503a1bc1788051347a1324bff41452"
        ]
      }
    },
  },
  "taiko-bridge": {
    "ethereum": {
      "owners": [
        "0xd60247c6848B7Ca29eDdF63AA924E53dB6Ddd8EC",
        "0x996282cA11E5DEb6B5D122CC3B9A1FcAAD4415Ab"
      ],
      "fetchCoValentTokens": true
    },
  },
  "tzwrap": {
    "ethereum": {
      "owner": "0x5Dc76fD132354be5567ad617fD1fE8fB79421D82",
      "fetchCoValentTokens": true
    },
  },
  "unichain": {
    "ethereum": {
      "owners": [
        "0x81014F44b0a345033bB2b3B21C7a1A308B35fEeA",
        "0x0bd48f6B86a26D3a217d0Fa6FfE2B491B956A7a2"
      ],
      "fetchCoValentTokens": true
    },
  },
  "wc": {
    "ethereum": {
      "owners": [
        "0xd5ec14a83B7d95BE1E2Ac12523e2dEE12Cbeea6C",
        "0x470458C91978D2d929704489Ad730DC3E3001113",
        "0x153A69e4bb6fEDBbAaF463CB982416316c84B2dB"
      ],
      "fetchCoValentTokens": true
    },
  },
  "xai-bridge": {
    "arbitrum": {
      "owners": [
        "0xb591cE747CF19cF30e11d656EB94134F523A9e77",
        "0xb15A0826d65bE4c2fDd961b72636168ee70Af030"
      ],
      "fetchCoValentTokens": true
    },
  },
  "xdai": {
    "start": "2018-10-08",
    "ethereum": {
      "ownerTokens": [
        [
          [
            ADDRESSES.ethereum.SAI,
            ADDRESSES.ethereum.DAI,
            "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643"
          ],
          "0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016"
        ],
        [
          [
            "0x1a5f9352af8af974bfc03399e3767df6370d82e4"
          ],
          "0xed7e6720ac8525ac1aeee710f08789d02cd87ecb"
        ]
      ],
      "owners": [
        "0x88ad09518695c6c3712AC10a214bE5109a655671",
        "0x7301CFA0e1756B71869E93d4e4Dca5c7d0eb0AA6",
        "0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d"
      ],
      "fetchCoValentTokens": true
    },
  },
  "yellow": {
    "methodology": "The total amount of assets locked in the Yellow Wallet.",
    "ethereum": {
      "owner": "0xb5F3a9dD92270f55e55B7Ac7247639953538A261",
      "tokens": [],
      "fetchCoValentTokens": true
    },
    "linea": {
      "owner": "0xb5F3a9dD92270f55e55B7Ac7247639953538A261",
      "tokens": [],
      "fetchCoValentTokens": true
    },
    "polygon": {
      "owner": "0xb5F3a9dD92270f55e55B7Ac7247639953538A261",
      "tokens": [],
      "fetchCoValentTokens": true
    },
    "scroll": {
      "owner": "0xb5F3a9dD92270f55e55B7Ac7247639953538A261",
      "tokens": [],
      "fetchCoValentTokens": true
    },
  },
  "zkfair": {
    "ethereum": {
      "owner": "0x9cb4706e20A18E59a48ffa7616d700A3891e1861",
      "fetchCoValentTokens": true
    },
  },
  "zksync-lite": {
    "ethereum": {
      "owner": "0xaBEA9132b05A70803a4E85094fD0e1800777fBEF",
      "fetchCoValentTokens": true
    },
  },
  "zora": {
    "ethereum": {
      "owners": [
        "0x3e2Ea9B92B7E48A52296fD261dc26fd995284631",
        "0x1a0ad011913A150f69f6A19DF447A0CfD9551054"
      ],
      "fetchCoValentTokens": true
    },
  },
  "smoothy": {
    "ethereum": {
      "owner": "0xe5859f4efc09027a9b718781dcb2c6910cac6e91",
      "fetchCoValentTokens": true
    },
    "bsc": {
      "owner": "0xe5859f4efc09027a9b718781dcb2c6910cac6e91",
      "fetchCoValentTokens": true
    }
  },
  "rehold": {
    "hallmarks": [
      ["2023-07-07", "ReHold V2 Launch"],
      ["2023-07-19", "Ethereum Deployment"],
      ["2023-08-01", "Limit Orders Launch"],
      ["2023-10-30", "ReHold Swaps Launch"]
    ],
    "bsc": { "owner": "0xd476ce848c61650e3051f7571f3ae437fe9a32e0", "fetchCoValentTokens": true },
    "polygon": { "owner": "0xd476ce848c61650e3051f7571f3ae437fe9a32e0", "fetchCoValentTokens": true },
    "avax": { "owner": "0xd476ce848c61650e3051f7571f3ae437fe9a32e0", "fetchCoValentTokens": true },
    "arbitrum": { "owner": "0xd476ce848c61650e3051f7571f3ae437fe9a32e0", "fetchCoValentTokens": true },
    "optimism": { "owner": "0xd476ce848c61650e3051f7571f3ae437fe9a32e0", "fetchCoValentTokens": true },
    "fantom": { "owner": "0xd476ce848c61650e3051f7571f3ae437fe9a32e0", "fetchCoValentTokens": true }
  },
  "loopring": {
    "ethereum": {
      "owners": [
        "0x944644Ea989Ec64c2Ab9eF341D383cEf586A5777",
        "0x674bdf20A0F284D710BC40872100128e2d66Bd3f"
      ],
      "fetchCoValentTokens": true
    },
    "taiko": {
      "owners": ["0x3e71a41325e1d6B450307b6535EC48627ac4DaCC"],
      "tokens": [
        ADDRESSES.null,
        ADDRESSES.taiko.USDC,
        ADDRESSES.taiko.USDT,
        ADDRESSES.taiko.DAI,
        ADDRESSES.taiko.LRC,
        ADDRESSES.taiko.TAIKO
      ]
    },
    "base": {
      "owners": ["0x732771F202ed19Ca8e1844d334e1df5641DC99Fe"],
      "fetchCoValentTokens": true
    }
  },
  "avax": {
    "ethereum": {
      "owner": "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      "fetchCoValentTokens": true
    },
    "bitcoin": { "__empty": true } // migrated to lombard
  },
  "railgun": {
    "ethereum": {
      "tvl": {
        "owner": "0xFA7093CDD9EE6932B4eb2c9e1cde7CE00B1FA4b9",
        "fetchCoValentTokens": true,
        "blacklistedTokens": [
          "0x2e14949ce0133ccfd4c0cbe707ba878015a7a40c",
          "0xe76C6c83af64e4C60245D8C7dE953DF673a7A33D" // RAIL
        ]
      },
      "staking": { "__staking": ["0xee6a649aa3766bd117e12c161726b693a1b2ee20", "0xe76C6c83af64e4C60245D8C7dE953DF673a7A33D"] }
    },
    "bsc": {
      "owner": "0x590162bf4b50F6576a459B75309eE21D92178A10",
      "fetchCoValentTokens": true,
      "blacklistedTokens": [
        "0x2e14949ce0133ccfd4c0cbe707ba878015a7a40c",
        "0x3F847b01d4d498a293e3197B186356039eCd737F" // RAIL
      ]
    },
    "polygon": {
      "owner": "0x19B620929f97b7b990801496c3b361CA5dEf8C71",
      "fetchCoValentTokens": true,
      "blacklistedTokens": [
        "0x2e14949ce0133ccfd4c0cbe707ba878015a7a40c",
        "0x92A9C92C215092720C731c96D4Ff508c831a714f" // RAIL
      ]
    },
    "arbitrum": {
      "owner": "0xFA7093CDD9EE6932B4eb2c9e1cde7CE00B1FA4b9",
      "fetchCoValentTokens": true,
      "blacklistedTokens": ["0x2e14949ce0133ccfd4c0cbe707ba878015a7a40c"]
    }
  },
  "epoch-island": {
    "start": "2023-11-17",
    "hallmarks": [
      ["2023-11-17", "vEPOCH Launch"],
      ["2024-01-03", "ITO Launch"]
    ],
    "ethereum": {
      "tvl": { "owner": "0x44DE78EB54EE54C4151e62834D3B5a29005Bde98", "fetchCoValentTokens": true, "blacklistedTokens": ["0x97D0CfEB4FdE54B430307c9482d6f79C761Fe9B6"] },
      "pool2": { "__staking": ["0x731a2572b1cf56cfb804c74555715c8c8b5e980b", "0x82b8c7c6Fb62D09CfD004309c1F353FB1A926Edc"] }
    },
    "base": { "owner": "0x44DE78EB54EE54C4151e62834D3B5a29005Bde98", "fetchCoValentTokens": true, "blacklistedTokens": ["0x287f0D88e29a3D7AEb4d0c10BAE5B902dB69B17D"] },
    "arbitrum": { "owner": "0x44DE78EB54EE54C4151e62834D3B5a29005Bde98", "fetchCoValentTokens": true, "blacklistedTokens": ["0x4939ac5c1855302891c5888634b2f65cc30b9155"] },
    "optimism": { "owner": "0x44DE78EB54EE54C4151e62834D3B5a29005Bde98", "fetchCoValentTokens": true, "blacklistedTokens": ["0xd1cac46a9a77169C310c2C780A4267eE6CA884f5"] }
  },
  "unilend": {
    "methodology": "We count liquidity on the Pools through UnilendFlashLoansCore Contract",
    "ethereum": {
      "tvl": { "owners": ["0x13A145D215182924c89F2aBc7D358DCc72F8F788"], "fetchCoValentTokens": true, "blacklistedTokens": ["0x0202Be363B8a4820f3F4DE7FaF5224fF05943AB1", "0x5b4cf2c120a9702225814e18543ee658c5f8631e"] },
      "staking": { "__staking": ["0x13A145D215182924c89F2aBc7D358DCc72F8F788", "0x0202Be363B8a4820f3F4DE7FaF5224fF05943AB1"] }
    },
    "polygon": { "owners": ["0x13A145D215182924c89F2aBc7D358DCc72F8F788"], "fetchCoValentTokens": true, "blacklistedTokens": ["0x0202Be363B8a4820f3F4DE7FaF5224fF05943AB1", "0x5b4cf2c120a9702225814e18543ee658c5f8631e"] },
    "bsc": {
      "tvl": { "owners": ["0x13A145D215182924c89F2aBc7D358DCc72F8F788"], "fetchCoValentTokens": true, "blacklistedTokens": ["0x0202Be363B8a4820f3F4DE7FaF5224fF05943AB1", "0x5b4cf2c120a9702225814e18543ee658c5f8631e"] },
      "staking": { "__staking": ["0x13A145D215182924c89F2aBc7D358DCc72F8F788", "0x2645d5f59D952ef2317C8e0AaA5A61c392cCd44d"] }
    }
  },
  "pwn": {
    "misrepresentedTokens": true,
    "methodology": "Sums up all the tokens deposited in the PWN Protocol. NFTs are resolved to their floor price using Chainlink price feeds. Note that NFTs are resolved only on Ethereum.",
    "ethereum": {
      "owners": ["0x45DB28b2d4878Ad124c037d4558AcF5Db3bBa6A5", "0xb98eFE56deCCeb1BeC9fAEeAF62500deb0953474", "0x19e3293196aee99BB3080f28B9D3b4ea7F232b8d", "0x50160ff9c19fbE2B5643449e1A321cAc15af2b2C", "0x57c88D78f6D08b5c88b4A3b7BbB0C1AA34c3280A", "0x9A93AE395F09C6F350E3306aec592763c517072e", "0x0773d5F2f7b3264a9Eb285F085aCCcC53d5aAa4F", "0x719A69d0dc67bd3Aa7648D4694081B3c87952797"],
      "resolveNFTs": true,
      "resolveArtBlocks": true
    },
    "polygon": {
      "owners": ["0xaF0d978275a2e7e3109F8C6307Ffd281774C623E", "0xe52405604bF644349f57b36Ca6E85cf095faB8dA", "0x50160ff9c19fbE2B5643449e1A321cAc15af2b2C", "0x57c88D78f6D08b5c88b4A3b7BbB0C1AA34c3280A", "0x9A93AE395F09C6F350E3306aec592763c517072e", "0x0773d5F2f7b3264a9Eb285F085aCCcC53d5aAa4F", "0x719A69d0dc67bd3Aa7648D4694081B3c87952797"],
      "fetchCoValentTokens": true
    },
    "cronos": {
      "owners": ["0x973E09e96E64E4bf17e383a8A497Fb566284c707", "0x4188C513fd94B0458715287570c832d9560bc08a", "0x719A69d0dc67bd3Aa7648D4694081B3c87952797"],
      "fetchCoValentTokens": true,
      "tokenConfig": { "ignoreMissingChain": true }
    },
    "base": {
      "owners": ["0x6fD3f5439aB1C103599385929d5f4c19acdBd264", "0x4188C513fd94B0458715287570c832d9560bc08a", "0x9A93AE395F09C6F350E3306aec592763c517072e", "0x0773d5F2f7b3264a9Eb285F085aCCcC53d5aAa4F", "0x719A69d0dc67bd3Aa7648D4694081B3c87952797"],
      "fetchCoValentTokens": true
    },
    "arbitrum": {
      "owners": ["0x448E3D0a4BAa00FE511a03E7B27177AeDE6d9636", "0x57c88D78f6D08b5c88b4A3b7BbB0C1AA34c3280A", "0x9A93AE395F09C6F350E3306aec592763c517072e", "0x0773d5F2f7b3264a9Eb285F085aCCcC53d5aAa4F", "0x719A69d0dc67bd3Aa7648D4694081B3c87952797"],
      "fetchCoValentTokens": true
    },
    "optimism": {
      "owners": ["0x43Ffd9dF079451Fe7D16Ac2c51E13DF2a173B71E", "0x4188C513fd94B0458715287570c832d9560bc08a", "0x9A93AE395F09C6F350E3306aec592763c517072e", "0x0773d5F2f7b3264a9Eb285F085aCCcC53d5aAa4F", "0x719A69d0dc67bd3Aa7648D4694081B3c87952797"],
      "fetchCoValentTokens": true
    },
    "bsc": {
      "owners": ["0x4A75a527E97d853109aA6998a2B9E45a87A31e9f", "0x57c88D78f6D08b5c88b4A3b7BbB0C1AA34c3280A", "0x9A93AE395F09C6F350E3306aec592763c517072e", "0x0773d5F2f7b3264a9Eb285F085aCCcC53d5aAa4F", "0x719A69d0dc67bd3Aa7648D4694081B3c87952797"],
      "fetchCoValentTokens": true
    },
    "linea": {
      "owners": ["0x9A93AE395F09C6F350E3306aec592763c517072e", "0x0773d5F2f7b3264a9Eb285F085aCCcC53d5aAa4F", "0x719A69d0dc67bd3Aa7648D4694081B3c87952797", "0xbe13866797bbdE2646FFBb58F102FcA91EFC88F1"],
      "fetchCoValentTokens": true
    },
    "xdai": {
      "owners": ["0x9A93AE395F09C6F350E3306aec592763c517072e", "0x0773d5F2f7b3264a9Eb285F085aCCcC53d5aAa4F", "0x719A69d0dc67bd3Aa7648D4694081B3c87952797", "0x431131622e088Fb0F9828Ca05b62210fc9eDcC04"],
      "fetchCoValentTokens": true
    },
    "unichain": {
      "owners": ["0x322e86E6c813d77a904C5B4aa808a13E0AD4412f", "0x354869495Fd916ADAFc0626C3d60115240dc06f1"],
      "fetchCoValentTokens": true,
      "tokenConfig": { "ignoreMissingChain": true }
    },
    "wc": {
      "owners": ["0x719A69d0dc67bd3Aa7648D4694081B3c87952797", "0xc0aCA216Aa936511b24Ff238F610B02bE54e10AD"],
      "fetchCoValentTokens": true,
      "tokenConfig": { "ignoreMissingChain": true }
    },
    "mantle": { "tvl": { "__empty": true } }
  },
}
