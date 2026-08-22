const { cexExports } = require('../projects/helper/cex')

// Small static configs are inlined here; larger/dynamic ones live in their own file (see fileConfigs below)
const configs = {
  '21-co': {
    bitcoin: "twentyOneCo",
    solana: {
      owners: [
        "FvLsZiM3g2ZnehkK42c4EoLASBdchKnqzxyAEmGhViZq"
      ]
    },
    ripple: {
      owners: [
        "rHTG5htCXSNtcXDhFkaSsvB1s1ah6WYrFW"
      ]
    },
    litecoin: {
      owners: [
        "LbgDyHCVc6UwsKuDzt5jKwFdG5TLsN5tbf"
      ]
    },
    polkadot: {
      owners: [
        "161fEUkrGhhAog8QG1ik3sfch9UzPdvAJtUwRH6WZnsgqkuw"
      ]
    },
    cardano: {
      owners: [
        "addr1q976xcl3r2vt6he4q3rq6lyq8832v5mgpdds0e84z7vn0hma5d3lzx5ch40n2pzxp47gqw0z5efksz6mqlj029uexl0snqdsul"
      ]
    },
    doge: {
      owners: [
        "DMbNFKqJpr9B9XPfZL5zbgMTvzpN7h7sfz"
      ]
    },
    bep2: {}
  },
  'arkham-exchange': {
    ethereum: {
      owners: [
        "0x679Fb19dEc9d66C34450a8563FfDFD29C04e615A",
        "0x0323718324218dcBfF7c9f89bA5a5954F61A6c74",
        "0x794C629e4403CA7CEE126Cc19d6C7b002D0238a5"
      ]
    },
    bitcoin: "arkhamExchange",
    solana: {
      owners: [
        "H2qEpXtSEzQTH5xNFpA8VA1W2NKNZWxUoVpascxyWAK1",
        "3huamNpghPSPbgQSLX56B18Sj1hq5SE4KGxwTvhwJGnC"
      ]
    },
    doge: {
      owners: [
        "9xFftuJonFHopj9FB6tyW1kyxqusr4jrGh"
      ]
    },
    avax: {
      owners: [
        "0xDc2822D0685c0CcEAb07b35d6de4aC9280FB9cFF",
        "0x34407900475cEF87acE1597670A9A42F31961d02",
        "0xaF4E837d27cD6A5B33D67d51b88Ae42c0Bb3f1af"
      ]
    },
    ton: {
      owners: [
        "UQDT3cimS92wrKXrc7U6quPIM1ose_N5-R4U5byIUDHkF8pt",
        "UQDd2gNTRcIsgdUgf0DYMVcpxZuV78hegZ4D1tIj7xLKTwWn"
      ]
    },
    methodology: "Wallets can be tracked here: https://intel.arkm.com/explorer/entity/arkham-exchange"
  },
  'biconomy-cex': {
    ethereum: {
      owners: [
        "0xb03eDB668008459B3c6D948ab5Ab305581DbF69c",
        "0x3d79007ba1a68de986eb641a3c24d58a0c69587e",
        "0xF884B1bC1d91Cdf824e7f35D61EdfdB042c28C83",
        "0x16572Dc0f727C7E3012baD8dbE6B2CE1Cdc31670",
        "0xD888d549B511CE54efFa084f33744a59D452C729",
        "0x2c02f34e06f75380844F928b0CBAb1265338Ae27"
      ]
    },
    bitcoin: "biconomy",
    polygon: {
      owners: [
        "0x366ba28Ec89113454EA6e82bB606426e8cA22780"
      ]
    },
    tron: {
      owners: [
        "TEi2hVWDRMo61PAoi1Dwbn8hNXufkwEVyp"
      ]
    }
  },
  'bigone': {
    ethereum: {
      owners: [
        "0xd4dcd2459bb78d7a645aa7e196857d421b10d93f",
        "0x88e343f4599292c2cffe683c1bb93cd3480bdbab",
        "0xa30d8157911ef23c46c0eb71889efe6a648a41f7"
      ]
    },
    bitcoin: "bigone",
    solana: {
      owners: [
        "7BCp5XUXtKzZWYCvGR2fzFqoyKiJ7ozN8eCEHscpSMnB"
      ]
    },
    tron: {
      owners: [
        "TNrPUjc47JU1fgaQZPa1odQnD5RTdH3NSu"
      ]
    }
  },
  'binance-us': {
    ethereum: {
      owners: [
        "0x61189da79177950a7272c88c6058b96d4bcd6be2",
        "0x34ea4138580435b5a521e460035edb19df1938c1",
        "0xf60c2ea62edbfe808163751dd0d8693dcb30019c"
      ]
    },
    methodology: "This wallets where collect from etherscan labelling."
  },
  'bing-cex': {
    bitcoin: "bingCex",
    arbitrum: {
      owners: [
        "0xd3D3a295bE556Cf8cef2a7FF4cda23D22c4627E8"
      ]
    },
    bsc: {
      owners: [
        "0x0b07f64ABc342B68AEc57c0936E4B6fD4452967E",
        "0xc3dcd744db3f114f0edf03682b807b78a227bf74",
        "0x434742703055bd20f42142d9d70b0735a5eb1b14",
        "0x503b7050882335BAa0F384c671a23f9e7168a5ba"
      ]
    },
    ethereum: {
      owners: [
        "0xd3D3a295bE556Cf8cef2a7FF4cda23D22c4627E8",
        "0x909C1c195FC0a31758C7169B321B707C9F44886B",
        "0xF7b7775f6D31eC2d14984f1cA3e736F5FB896DA2",
        "0xAd8E5cEb7D77e10403Be8430717c515273c31b8d",
        "0x74E7Fd0b532f88cf8cC50922F7a8f51e3F320Fa7",
        "0xA1195F0d9B010F86633E1553F1286d74F80eF52B"
      ]
    },
    tron: {
      owners: [
        "TU72cTvdkWvoB7xgN5TXFtoXtUuWRuvUTm",
        "TVPQLkVXvN7MduHWhD4Q7rGVyRdDu5R8F6",
        "TErZkyXAoG4K67hmdvFUh6EgNARNETLkXX",
        "TRtC94y3QP9n5axxTsyaqsRtWDE5zwiyk3",
        "TFBfWTT5DPEWr3BEQQUJ1NpqS7cZuSntC7"
      ]
    },
    ripple: {
      owners: [
        "rPr5iwPZRVrxV7WACQxkYdoZtX4ikMxw9c",
        "rfqj8P5C36cRaFjpR5yYbb8XHYK9N5KNux"
      ]
    },
    solana: {
      owners: [
        "3Ln6KEgLoMR2xFHfqtYazP7CxFQPDtUVVtwCVsLKVfmV",
        "J1BGeK3ojLF5dqaNFLg7WkQToyYisY79pWvHHscTJcpD"
      ]
    },
    ton: {
      owners: [
        "UQDIv0mSHnXxE6C_CTIZXRkricGJwpUNg5PXU3BaZW1nFhqB",
        "UQCPPiMQG_bj1-C3oQzfsufaCQQiBCvNcPoMnsrV3pO9xrDg"
      ]
    }
  },
  'bitcointry': {
    bsc: {
      owners: [
        "0x13CB26668e11b39290AcaE7Bb8BFF1eC0B4dcAaD",
        "0xeb4b2ecaa3e732da97d5fa922634138b9c2be6b9",
        "0x57078A682ac277D444D8CeE278Dc6E2Ff0A52eA8"
      ]
    },
    base: {
      owners: [
        "0x13CB26668e11b39290AcaE7Bb8BFF1eC0B4dcAaD"
      ]
    },
    arbitrum: {
      owners: [
        "0x13CB26668e11b39290AcaE7Bb8BFF1eC0B4dcAaD"
      ]
    },
    ethereum: {
      owners: [
        "0x13CB26668e11b39290AcaE7Bb8BFF1eC0B4dcAaD",
        "0xeb4b2ecaa3e732da97d5fa922634138b9c2be6b9"
      ]
    },
    avax: {
      owners: [
        "0x13CB26668e11b39290AcaE7Bb8BFF1eC0B4dcAaD",
        "0xeb4b2ecaa3e732da97d5fa922634138b9c2be6b9"
      ]
    },
    polygon: {
      owners: [
        "0x13CB26668e11b39290AcaE7Bb8BFF1eC0B4dcAaD",
        "0xeb4b2ecaa3e732da97d5fa922634138b9c2be6b9"
      ]
    },
    optimism: {
      owners: [
        "0x13CB26668e11b39290AcaE7Bb8BFF1eC0B4dcAaD",
        "0xeb4b2ecaa3e732da97d5fa922634138b9c2be6b9"
      ]
    }
  },
  'bitkan': {
    ethereum: {
      owners: [
        "0x8e04af7f7c76daa9ab429b1340e0327b5b835748",
        "0xefa73f3858392565e1566b70caa27ce79337a2c3"
      ]
    },
    bitcoin: {
      owners: [
        "1GRciJqtfPgL3FJCCco3L3Q74XSaQ4Lr4E",
        "18qZ6nkZAQNCVktMixd9Kb3YJ5KPx4E5ov",
        "1E2tKutAWLWtBSwrH2T8XGr1ZjDqrQ6SdN"
      ]
    },
    polygon: {
      owners: [
        "0x8e04af7f7c76daa9ab429b1340e0327b5b835748"
      ]
    },
    tron: {
      owners: [
        "TPEXEpjuuRSxpV7vnCrHAefuAMV5VsNAQ4"
      ]
    },
    bsc: {
      owners: [
        "0x19c8da00dff2967ea4ec0d77aec93a8bc387e08b"
      ]
    },
    solana: {
      owners: [
        "6UsYfLKTdVGJdaWFBLjBYqqxFSUjh6nwpBqdh6R8n3sv"
      ]
    }
  },
  'bitlo-cex': {
    bitcoin: {
      owners: [
        "3392g7wWA64L8apgSLKHdDN7JxK9eeH6Sc",
        "33DtinVYzZcK5pg1AjCnGRefrDgXgrEZyw"
      ]
    },
    aptos: {
      owners: [
        "0xf6fbd3690200dd9a28eaf210349ca607a4df5eb63018845797241161a07e9dd6",
        "0x4daca89afce1b279856a7a2185d044be86840bb264c20f2061d3327ed40c2b2d"
      ]
    },
    algorand: {
      owners: [
        "TBXO5VXDTYVFRQBMK3PQZZRPCEKME2D7EKNBTT5MB4P2FOGKX4SPGNOB5A"
      ]
    },
    cardano: {
      owners: [
        "addr1qxheka95t9mgdvpta5tn7k0hzkd4vefm3xu2dgy20fn8nevvquk8gyd0mj7cfgju0ww69qvekezlf74jxl7jajds2dpqtr5hcc"
      ]
    },
    doge: {
      owners: [
        "D9PyugrmQdpoabcVUceMFUZubDx4JHzebd",
        "D9GEFr81xw1mnbq7HnMaTnywF3FwDGjiw8"
      ]
    },
    ethereum: {
      owners: [
        "0x57c2a615b268e8db97d17d6068a96f95f40176aa",
        "0x9c21d12400bae033f43497b6aa72c33f7ed12b79",
        "0x2AF26Fa3682edd327B4caf48158c814EEd7288a9"
      ]
    },
    near: {
      owners: [
        "6ab1742337f2734a9da8bc75091c0a4558280adc951be7db04feb4c1cea0edc1"
      ]
    },
    polkadot: {
      owners: [
        "13R98s5YQLiYUw8nhhKUD2KuPVko4xyc9rTtXFHRz5L5DF1H"
      ]
    },
    solana: {
      owners: [
        "D9tnx1BsZtjnJQKSPfY88tWrLkPeukCnUnzoG1GNmp4i",
        "ADfsfX95pX8VkHcF7i1JCLrwKZ5mQptQF5QcVQf5cv3A",
        "FDPWPcm3FrtQcQcAjd9k3biyco6RCwun9dgt8GpjReXk"
      ]
    },
    sui: {
      owners: [
        "0xd0bb3cc13817613004aee1974a9075dfe9a6290de4b397a8b31d22673e6be885"
      ]
    },
    tron: {
      owners: [
        "TCWBhFzyDMvFM2Xm5bDjTRmcfYumEd8LrS",
        "TBMfAkZXi2fg9VXHeJqzZrmFwN2VooDBeZ"
      ]
    },
    ripple: {
      owners: [
        "rUTyLdTBDcajmCBZYnRVmHTUAMuCzbNgnC"
      ]
    }
  },
  'bitmake': {
    bitcoin: "bitmake",
    methodology: "We are only tracking one BTC wallet. We dont have information regarding other wallets"
  },
  'bitmark': {
    ethereum: {
      owners: [
        "0x328130164d0f2b9d7a52edc73b3632e713ff0ec6",
        "0xeacb50a28630a4c44a884158ee85cbc10d2b3f10",
        "0x3ab28ecedea6cdb6feed398e93ae8c7b316b1182",
        "0x7563758243a262e96880f178aee7817dcf47ab0f",
        "0x6D0D19bddDC5ED1dD501430c9621DD37ebd9062d",
        "0x2982bB64bcd07Ac3315C32Cb2BB7e5E8a2De7d67",
        "0x7563758243A262E96880F178aeE7817DcF47Ab0f",
        "0x6D0D19bddDC5ED1dD501430c9621DD37ebd9062d",
        "0xa23EF2319bA4C933eBfDbA80c332664A6Cb13F1A"
      ]
    },
    bsc: {
      owners: [
        "0x328130164d0f2b9d7a52edc73b3632e713ff0ec6",
        "0xeacb50a28630a4c44a884158ee85cbc10d2b3f10",
        "0x3ab28ecedea6cdb6feed398e93ae8c7b316b1182",
        "0x7563758243a262e96880f178aee7817dcf47ab0f",
        "0x6D0D19bddDC5ED1dD501430c9621DD37ebd9062d",
        "0x2982bB64bcd07Ac3315C32Cb2BB7e5E8a2De7d67",
        "0x7563758243A262E96880F178aeE7817DcF47Ab0f",
        "0x6D0D19bddDC5ED1dD501430c9621DD37ebd9062d",
        "0xa23EF2319bA4C933eBfDbA80c332664A6Cb13F1A"
      ]
    },
    solana: {
      owners: [
        "CgANddXc7FKSsdLSdFv67X8faZqQaRTeLMXkAVANkZD4"
      ]
    },
    bitcoin: "bitmark",
    starknet: {
      owners: [
        "0x04de639e634c071c3ce8b1c69fac0500aab5ddb25a08fd0f757176243e4c0467"
      ]
    }
  },
  'bitmex': {
    bitcoin: "bitmex",
    ethereum: {
      owners: [
        "0xEEA81C4416d71CeF071224611359F6F99A4c4294",
        "0xfb8131c260749c7835a08ccbdb64728de432858e"
      ]
    },
    tron: {
      owners: [
        "TXByfwCqw899fEPAWTuF3gkhPvfLMLvdr9",
        "TU2wL7Vw2QM5KvMatsjjBKA6kKTntzCyyb"
      ]
    },
    solana: {
      owners: [
        "JnmCTvT4kewDDET2Yu3T1mJD6GAaTpmxBEPGKC7CMao",
        "47qgBcQGEBuWqNsE7QZ8NsXoe6fm5xLV94TDoYJzhgUV"
      ]
    },
    bsc: {
      owners: [
        "0xEEA81C4416d71CeF071224611359F6F99A4c4294",
        "0xfB8131c260749c7835a08ccBdb64728De432858E"
      ]
    },
    ripple: {
      owners: [
        "rWZSRkMfZzZERoQt1D3PaqNXQNqmCGaBs",
        "rpY2qHHTXiTqCZP56vvsxbvuazBKLWBX5z"
      ]
    },
    methodology: "We collect only wallets that have more than 20 bitcoins"
  },
  'bitomato': {
    bitcoin: "bitomato",
    ethereum: {
      owners: [
        "0x0b8b4EB21787d5a07AbAF6BC35E15CD5C59Cbb94"
      ]
    },
    bsc: {
      owners: [
        "0x0b8b4EB21787d5a07AbAF6BC35E15CD5C59Cbb94"
      ]
    },
    methodology: "We are tracking part of their cold wallets for Bitomato. The addresses were provided based on public information and verified activity."
  },
  'bitunix-cex': {
    ethereum: {
      owners: [
        "0x76B0aB5067B3be922ef4698390Ca8bd5812A5080",
        "0x6Fe39F2831caF58529779EFDB73341Aa64df50Ab",
        "0x431CA183bD6c2fd4a160ac28363D1719f3F12779"
      ]
    },
    ripple: {
      owners: [
        "rpQATJWPPdNMxVCTQDYcnRNwtFDnanT3nk",
        "rsTbV9cNvGJfQdnHdVx9WNRZ5jFEizHjT5"
      ]
    },
    bitcoin: "bitunixCex",
    tron: {
      owners: [
        "THoW5StbzYdfhh9XUopYYhPJbJWJehoCjo",
        "TDcgiw8HxnhHEhwPf7PYu5RUMpP7EygAXr",
        "THgxDnzzGJYhZXnKKXm6cg1594vhLzmTGx",
        "TRLEKU5ySBEoCSAFUuzYyZN5wxbx2Ho2jt",
        "TG3NXULKi8WVUFtw7Lg7RM6ahGyvY5mhC2",
        "TAS4yce3Jh5Rrk94SrViMq9mER3NXkqUXi",
        "TVUuCWs6mUVvMrB527mVspe6nfh4nUdDWR",
        "TFmCzjvmDN3Juk5VbLPctbZ3gx2ziK8ui4",
        "TGxnRqZTkpVk53djTt4ptzTagJe5t7c4jV"
      ]
    },
    arbitrum: {
      owners: [
        "0x6Fe39F2831caF58529779EFDB73341Aa64df50Ab"
      ]
    },
    bsc: {
      owners: [
        "0x6Fe39F2831caF58529779EFDB73341Aa64df50Ab"
      ]
    },
    base: {
      owners: [
        "0x6Fe39F2831caF58529779EFDB73341Aa64df50Ab"
      ]
    },
    avax: {
      owners: [
        "0x6Fe39F2831caF58529779EFDB73341Aa64df50Ab"
      ]
    },
    polygon: {
      owners: [
        "0x6Fe39F2831caF58529779EFDB73341Aa64df50Ab"
      ]
    },
    optimism: {
      owners: [
        "0x6Fe39F2831caF58529779EFDB73341Aa64df50Ab"
      ]
    },
    solana: {
      owners: [
        "9jA4MUtsPAXy3ZhsiQUhkSXMop2ogrCWYv7rE9xovsWp"
      ]
    },
    litecoin: {
      owners: [
        "ltc1qcnt4f7zqpu2s4pde3h4sjrkn3ekmlvr8ytk3s5"
      ]
    },
    ton: {
      owners: [
        "UQDQ6wuXpMMUy4f-kNkDDyW05V5Exx7d40OaopVd11uzkMRt"
      ]
    },
    cardano: {
      owners: [
        "addr1qxawa6kw3wxtqxdaegrcph045lpqh3gkk4t9xj0ype676n59qwmq25cjka2q0zsjp0dq8a8c8v83p4p0twrp4q04a08sdm3epa"
      ]
    }
  },
  'bitvavo': {
    ethereum: {
      owners: [
        "0x95B564F3B3BaE3f206aa418667bA000AFAFAcc8a",
        "0x079A892628EBf28d0Ed8f00151cff225A093dc63",
        "0xedC6BacdC1e29D7c5FA6f6ECA6FDD447B9C487c9",
        "0xb0A3A2B60E969AFD26561429Aa4c1444C57E4411"
      ]
    },
    solana: {
      owners: [
        "5BCgqYg51CANe8qUMPYWJsqRA4Y8HnyfmvkoJxcEmQfY",
        "2h8JJq1kAsJvKYVrsEqwhQTcy99p465esHUFcJA94QY2"
      ]
    },
    bitcoin: {
      owners: [
        "bc1qfpeps3wcmzk422hvm5jeq5lelnqlzznjwyfy69",
        "37biYvTEcBVMoR1NGkPTGvHUuLTrzcLpiv",
        "bc1qrd7t2sl5rdfke32qcryyep6r78vyq703mvggq7"
      ]
    },
    bsc: {
      owners: [
        "0x079A892628EBf28d0Ed8f00151cff225A093dc63"
      ]
    },
    base: {
      owners: [
        "0x079A892628EBf28d0Ed8f00151cff225A093dc63",
        "0xb0A3A2B60E969AFD26561429Aa4c1444C57E4411"
      ]
    },
    optimism: {
      owners: [
        "0x079A892628EBf28d0Ed8f00151cff225A093dc63",
        "0xb0A3A2B60E969AFD26561429Aa4c1444C57E4411"
      ]
    },
    hyperliquid: {
      owners: [
        "0xb0A3A2B60E969AFD26561429Aa4c1444C57E4411"
      ]
    },
    plasma: {
      owners: [
        "0xb0A3A2B60E969AFD26561429Aa4c1444C57E4411"
      ]
    },
    arbitrum: {
      owners: [
        "0xb0A3A2B60E969AFD26561429Aa4c1444C57E4411"
      ]
    },
    linea: {
      owners: [
        "0xb0A3A2B60E969AFD26561429Aa4c1444C57E4411"
      ]
    },
    sonic: {
      owners: [
        "0xb0A3A2B60E969AFD26561429Aa4c1444C57E4411"
      ]
    },
    era: {
      owners: [
        "0xb0A3A2B60E969AFD26561429Aa4c1444C57E4411"
      ]
    }
  },
  'bitvenus': {
    ethereum: {
      owners: [
        "0x5631aa1fc1868703a962e2fd713dc02cad07c1db",
        "0x4785e47ae7061632c2782384da28b9f68a5647a3",
        "0x25Ee4Ce905Da85df8620cB82884adDf96A14498A",
        "0xE1E5F8caCc6B9Ace0894Fe7ba467328587e60bE7",
        "0xb8001c3ec9aa1985f6c747e25c28324e4a361ec1"
      ]
    },
    bitcoin: "bitvenus",
    bsc: {
      owners: [
        "0x4785e47aE7061632C2782384DA28B9F68a5647a3"
      ]
    },
    tron: {
      owners: [
        "TPbExxiw99nMsDfWVjaweSPkMVQfZSVVZj",
        "TSM8m5ADsMRySsWy7d4REX7FBXusMQCi6y"
      ]
    },
    methodology: "This wallets where provide by BitVenus team on the 07/02/2023. *On the 14/07/2023 BitVenus team provided new wallets. A new wallet was provide on the 15/12/2023 by bitvenus team"
  },
  'btse': {
    bitcoin: "btse"
  },
  'bydfi': {
    bitcoin: "bydfi",
    ethereum: {
      owners: [
        "0x845DFA5366776fe44AA49e630C0C86A069D5acD4",
        "0x9772db485b028616e85a41b718047de21aef31fe"
      ]
    },
    ripple: {
      owners: [
        "rDrEru8GJAzzVEEunrLdd65YP5PppV8ESX",
        "rGzBXiAk5AhAmsCN2yZg9fmPzqsdyHttXt"
      ]
    }
  },
  'bytedex-cex': {
    ethereum: {
      owners: [
        "0x7fcb38e8a9aeb1e735b2468873561f22e5eb1f53"
      ]
    },
    bitcoin: "bytedex"
  },
  'cake-defi': {
    ethereum: {
      owners: [
        "0xc5a0a17eabbb0e64dcd567b5670c8c5d5c34128c",
        "0x94fa70d079d76279e1815ce403e9b985bccc82ac",
        "0xb5e2d774c4672aa4297272f62d61e8a041175cb5",
        "0x3ec49e613ae70beb0631d7666f46d4ff2813932e",
        "0xC889Faf456439Fb932B9Ce3d4F43D8078177fD29",
        "0x883C4599C455Fc337CA43BF9d63eBA45F995a769"
      ]
    },
    polygon: {
      owners: [
        "0xaa6c7eAF827E04185D7A6a6A6156195AB5BDBE4c"
      ]
    },
    bitcoin: "cakeDefi",
    litecoin: {
      owners: [
        "MLYQxJfnUfVqRwfYXjDJfmLbyA77hqzSXE"
      ]
    },
    methodology: "As Bake.io (formerly Cake DeFi) is a CeDeFi platform, its assets associated to the staking nodes are not included for the purposes of the TVL calculation. In this case, there are approximately $121.4M in DFI chain (nodes), and around $24.7M in ETH chain (nodes) as of 31 March 2023. The calculation methodology are as follows: DFI: 10846 (nodes) * 20K (collateral per node) *$0.56 = $121.4M. ETH: 430 * 32 *$1800 = $24.7M, we also do not track Bitcoin Cash and Dogecoin. Bake.io publishes information on all its nodes on its Transparency page here: https://bake.io/transparency.",
    hallmarks: [
      [
        "2023-04-03",
        "Change Of Wallets"
      ],
      [
        "2023-11-24",
        "Change Of Wallets"
      ]
    ]
  },
  'coin8-cex': {
    ethereum: {
      owners: [
        "0x76d90b0f8150797d9eb4ce91bca2829f494c3766",
        "0x8332086fa910f6e72e9793778d91b6f9ef2d719d",
        "0xa63811cd3abdbc0bd0f668a9eb98b97a96ead95f",
        "0x9b9B873F2Bf299B0E8C5b2E8Ff220Dc5cb4330E1",
        "0xFBcE3974014022853136989149787df66D54E623",
        "0x66AAD5CA93438D565909De0bF444b45e543d98E9",
        "0x2355969e0692D41bCbB5e695513C0cF4Ae6059C2",
        "0x0733E99402D268D4475A8F5E45987Db04bA66181",
        "0xd83Daa277d9DAD1f34aDE22002806251f04f4a28",
        "0x748577Ce82346C61e9d6e52628Eda8dFaB3241b3",
        "0xaDc7cf570DDf2Ff99C723F946c7F5A5D34cF868C"
      ]
    },
    bitcoin: "coin8",
    arbitrum: {
      owners: [
        "0x3465136aa1ab5fd78bae06a91c280157532c62b8",
        "0xebb54920eda335dfcde8a904f8293bcb5ac64aff",
        "0x66AAD5CA93438D565909De0bF444b45e543d98E9"
      ]
    },
    bsc: {
      owners: [
        "0x8f3d8dde9f2687d93640ecede2a91b1dc3404bd6",
        "0xef01a7711d046af41597c308369b9c8d5873ae96",
        "0x9b9B873F2Bf299B0E8C5b2E8Ff220Dc5cb4330E1",
        "0xF4271F1c5ABa50B9c18d229311FD22C4Cc7B70b6",
        "0xa089b8de0eA45db84CCadE5751EE165A88F90b4F",
        "0xFBcE3974014022853136989149787df66D54E623",
        "0xC349541773D5eCa27D36E9bD95094920f4B7A536",
        "0x66AAD5CA93438D565909De0bF444b45e543d98E9"
      ]
    },
    solana: {
      owners: [
        "8HTUpmDQAXeMtKMyojVFY32iAzhG6tEg6zqvASAzHnNd",
        "9JSjQQMTmkTSGHT5s6aKnJop6q6hsqMvkTGLzrC9x1NP"
      ]
    },
    ripple: {
      owners: [
        "rKpRrFhAk8w3WzhoKDA9XrVf9F9CCUrnY5"
      ]
    },
    polygon: {
      owners: [
        "0x66AAD5CA93438D565909De0bF444b45e543d98E9"
      ]
    },
    avax: {
      owners: [
        "0x66AAD5CA93438D565909De0bF444b45e543d98E9"
      ]
    },
    tron: {
      owners: [
        "TWGV42YRYpK1rfMHZCYYxhK1fZDbTNrqzz",
        "TZD1mbbNqnffBRSr8zEjWo6L37vk3nxhvT",
        "TFjKKNBqrsjRhmPnimyArxTuPxq5HkG9T7"
      ]
    }
  },
  'coinsquare': {
    ethereum: {
      owners: [
        "0x02fdc44Bf226E49DCecA4775Afaef3360e9C4EE9",
        "0x0fcFF154753e337983613889b69dd85Fe8a1a145",
        "0x14AA1AD09664c33679aE5689d93085B8F7c84bd3",
        "0x3858A27eeCB5f1144473E35A293cb1B2bda6DfF4",
        "0x476B067CbFF8ACB805038E9dAEF5D51c7612d593",
        "0x48a0B5f7DE8789a3962918C6DF4A766c0c8857B0",
        "0x56E89a4b2E3924c336d52CE0ad98fF23E1a51627",
        "0x6A73f209d25CC9c089170cc5b54962e0c7614E0c",
        "0x6d712f120bD65aD54a5F56670976788a044Cb987",
        "0x7061d86A274B398a1fB7Cdb74B3abBc7601e105f",
        "0x7ee87dd5BB9924Cb85CA2916Bd4E04299D3A8EcC",
        "0x82Be7cFeF05B70c4AF47F8fd70F636201121341b",
        "0x8623c08A4B880799CF65E75137ec9759DB336637",
        "0x89813b57AE92e74Fb808eb7639d3A0050c9b3D7D",
        "0x8e080C5d233F2A14A37d024c0382bF0585146993",
        "0x910695E5C7c14499B554fb132A9710988a42fC38",
        "0x9C6D4A1922Eed56Ee9de148c5BA9b1b477FEcBb6",
        "0xC4d75abAb14Ef006d5Ac9fe901a8ed616C4e2627",
        "0xD381347EE757F53aE4B3b6822DAeC3E2A14B2005",
        "0xD5B2C371808018ee131ad387877C4d58e08e7A06",
        "0xd093F2Ee92cf32B4D3EBefd965447415074DD6c8",
        "0xf9c91937737cCaFE9bBb662b1917B54F9606Ca13",
        "0xfac596Facd1901458C1C6347397a6e5D0769736c"
      ]
    },
    bitcoin: "coinsquare",
    avax: {
      owners: [
        "0x14AA1AD09664c33679aE5689d93085B8F7c84bd3"
      ]
    },
    solana: {
      owners: [
        "4DgunMfBb19GaMZ1Z48oqcymZ4eBA4v5SUdRnapzj66G"
      ]
    },
    cardano: {
      owners: [
        "addr1vysfm34dhk3an94lz0s8p76rcze7ee5060dp9uenku5g2jc9dapls"
      ]
    },
    cosmos: {
      owners: [
        "cosmos12chvl78ffgvzc29mvrg5auz94vgksne5svsje4"
      ]
    },
    ripple: {
      owners: [
        "rBrgepoU9B4tZkXKsp9oHns252mkAFLrYj",
        "rsae9sMcxRe9WXHFM3WJJ3NdZESaoRY3KC"
      ]
    },
    litecoin: {
      owners: [
        "LNwvCzirtdVFTeG3YcQZ3Cg7FPCwmyeYJm",
        "LeZcdqjgfd3L8vDVYWGuFvrJyT2Xy9grCf",
        "LYSR1E7kzoxnX8fbgRgDUJo1VVd2H1vwXF",
        "LPosd2yrP7RNP688yFTuMnMnhSrs5zLPia",
        "LPVrozsF3z6C6mYRGKN6xRCHs7dm1htTYs",
        "Lax8DbJauyWhV5YNTaeZge4oBP2HTNiqYz"
      ]
    },
    doge: {
      owners: [
        "D9uH999MANKyNkzfb8XwRmQhHEBNLBh9sA",
        "DQNrmw9tb9NDxyhjb6BvJnvAvDBC3CMurE",
        "DAMt5CrmkVuiNDEWCWRiyecpvNKi58FSbd",
        "DGXx3yTPND5E7uJdCzLe945ri6Qa9as3Go",
        "DAd1JWwtwx1paUuWG71ePNLU3WJUFaMJoh"
      ]
    }
  },
  'coinstore': {
    ethereum: {
      owners: [
        "0xf2067abfab8bc621211935431519d41825d2f344",
      ]
    },
    bsc: {
      owners: [
        "0x20664cacdcfeb318c8e145a03c75e34bc2cc4a3b",
        "0x6148f792622c3B85F04f87E8a09474a591E71C5f",
        "0x40C847f59600286cFEE8d6De6640E967a7824d57"
      ]
    },
    arbitrum: {
      owners: [
        "0x2a6e62f040a7f0b830847da101539a7eef7bb040"
      ]
    },
    optimism: {
      owners: [
      ]
    },
    polygon: {
      owners: [
        "0x65e1615efc11c63e15c00ac4447c56af294135a9"
      ]
    },
    avax: {
      owners: [
        "0x1e14f71c96262c45167465ab380b684d652377d9"
      ]
    },
    base: {
      owners: [
      ]
    },
    bitcoin: {
      owners: [
        "bc1q4w3drxrdhcsxlrhrqpl7kecesn53pf455muj30"
      ]
    },
    solana: {
      owners: [
        "27XKFUkuY8VyXLbinENSVp4aTxHSCtZcJ9poKWP4GEuj",
        "DVoATqaFVS98WwbGAYvBxUAX88bWTrW9Ej2mgFJ8Gm64",
        "2YH3L1nAknnDC5Bu6S6Z5Dzurw2fUG63Msws96NLRpAi"
      ]
    },
    tron: {
      owners: [
        "TBhbX5S51L1C34wBExL9efV5YfTE5NAFi1",
        "TJa4jS3qsAa2je4ksDP9BD7NzsffuWfRQK",
        "TM7rxykbNRuFd2iZ1zVH4P8xrpSCduw9vD"
      ]
    }
  },
  'coinw': {
    ethereum: {
      owners: [
        "0xa20f10289248717374e9b7776dc368aa526cb6f2",
        "0x611f32e5d7f6640ecaf3e66759318abb9cbece64",
        "0x2d6323cc438b96f0ae942280762cc507b5398563",
        "0xbf2d58698a8a215f868cf24baba360c77266b466",
        "0x3864d8f360ba98212a2eddf05a357599f25196c1",
        "0xb840fe2b3fd8f75275240c671d6ec659e4c9a500",
        "0xe48a4e20be4ea888748c56bdcb632d960cbfb011"
      ]
    },
    bitcoin: "coinw",
    tron: {
      owners: [
        "TEdzoWmVaKnSjvbY33FNjkGogo5xKUkSRD",
        "TXWmdMZkLA45WPiKqTMeLvcHPeZSj1npdp",
        "TRg92o9H1T7m5beDvTzqGYJ1CLoyEnjUpB",
        "TTvYfJhC45kLriLTEAbVawBrBQhAW8shh3"
      ]
    }
  },
  'crypto-com': {
    bitcoin: "cryptoCom",
    ethereum: {
      owners: [
        "0x72a53cdbbcc1b9efa39c834a540550e23463aacb",
        "0x6262998ced04146fa42253a5c0af90ca02dfd2a3",
        "0xcffad3200574698b78f32232aa9d63eabd290703",
        "0x7758e507850da48cd47df1fb5f875c23e3340c50",
        "0x46340b20830761efd32832a74d7169b29feb9758",
        "0xf3b0073e3a7f747c7a38b36b805247b222c302a3"
      ]
    },
    bsc: {
      owners: [
        "0x72A53cDBBcc1b9efa39c834A540550e23463AAcB",
        "0xcffad3200574698b78f32232aa9d63eabd290703",
        "0x7758e507850da48cd47df1fb5f875c23e3340c50",
        "0xcffad3200574698b78f32232aa9d63eabd290703"
      ]
    },
    polygon: {
      owners: [
        "0x72A53cDBBcc1b9efa39c834A540550e23463AAcB",
        "0xcffad3200574698b78f32232aa9d63eabd290703",
        "0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3",
        "0x7758e507850da48cd47df1fb5f875c23e3340c50",
        "0xcffad3200574698b78f32232aa9d63eabd290703"
      ]
    },
    arbitrum: {
      owners: [
        "0xcffad3200574698b78f32232aa9d63eabd290703",
        "0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3",
        "0x72A53cDBBcc1b9efa39c834A540550e23463AAcB",
        "0x7758e507850da48cd47df1fb5f875c23e3340c50",
        "0xcffad3200574698b78f32232aa9d63eabd290703"
      ]
    },
    avax: {
      owners: [
        "0xcffad3200574698b78f32232aa9d63eabd290703",
        "0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3",
        "0x72A53cDBBcc1b9efa39c834A540550e23463AAcB",
        "0x7758e507850da48cd47df1fb5f875c23e3340c50",
        "0xcffad3200574698b78f32232aa9d63eabd290703"
      ]
    },
    optimism: {
      owners: [
        "0xcffad3200574698b78f32232aa9d63eabd290703",
        "0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3",
        "0x72A53cDBBcc1b9efa39c834A540550e23463AAcB",
        "0x7758e507850da48cd47df1fb5f875c23e3340c50",
        "0xcffad3200574698b78f32232aa9d63eabd290703"
      ]
    },
    fantom: {
      owners: [
        "0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3",
        "0x72A53cDBBcc1b9efa39c834A540550e23463AAcB",
        "0x7758e507850da48cd47df1fb5f875c23e3340c50",
        "0xcffad3200574698b78f32232aa9d63eabd290703"
      ]
    }
  },
  'cygnus-btc': {
    bitcoin: "cygnus"
  },
  'deribit': {
    bitcoin: "deribit",
    ethereum: {
      owners: [
        "0x77021d475E36b3ab1921a0e3A8380f069d3263de",
        "0x5f397B62502e255f68382791947D54C4B2d37F09",
        "0xcfee6efec3471874022e205f4894733c42cbbf64",
        "0x2eeD6a08Fb89a5CD111efA33f8DcA46CfbEB370f",
        "0x6B378bE3c9642ccF25b1A27faCb8ace24aC34A12",
        "0xA7e15eF7C01B58eBe5eF74Aa73625Ae4b11FE754",
        "0x062448f804191128d71fc72e10a1d13bd7308e7e",
        "0xA0F6121319a34f24653fB82aDdC8dD268Af5b9e1",
        "0x904cC2B2694FFa78F04708D6F7dE205108213126",
        "0x63F41034871535ceE49996Cc47719891Fe03dff9",
        "0x58F56615180A8eeA4c462235D9e215F72484B4A3",
        "0x1baE874af9f81B8F93315b27F080260Da4702D3a",
        "0x2563328d58AC7eE9e930E89C29Ce96046a291207",
        "0x866c9a77d8Ab71d2874703e80cb7aD809b301e8e",
        "0xCf2027AAB22980820F0767d9f214CDBD2AA2428D",
        "0xACd41f0dA1A84f5543c84a33864e025cE30C099D",
        "0xc7125da07a7110049ecc68f43bf10de4d45ca84e",
        "0x1b995f9d96951f4a04c30d2e114819949e971bc8",
        "0x245772af12d1c31e2b7d6ea810a91c1f3db4eb94",
        "0x282f9830e74d887Da489C030cB1EF1D328EaC0A9",
        "0x98F980a6f4800b53db7DF568B5e1F6f230d661e5",
        "0xb61a16BDa6D61D9b8AD493BF05962c5b98D1712F",
        "0x8F5F8ada4D19BF4ffBE580e4ce92af424e60C720",
        "0x369F8406A13729c168526018697F0da667656cde",
        "0x3d09D2354530466D32Ed37C6Ad19eA58504A0C37",
        "0x4e67722883AD992182e83b79Bf06A93972963caC"
      ]
    },
    solana: {
      owners: [
        "H8z2yZcrKo7ngiMz3Vsuw823nYo11qdCqs3sJDDjeTdD",
        "A5ANHizfayJUDBSwV5Cm7CNXCj6E6AAda49wzzdYPons",
        "BZo9RRbgsWaLMxyaYiJK9D27j2FAVgHrhMJBvAj7GiyG",
        "DL165xn6SrdupXGA2MW6woz35B3ssVqpYfwS1xAKdyx",
        "7wx23rZmR4tikqW9avcby5Pf8QEuBTo7HKUtpCt9r9nz",
        "FbchixvxTEW24Mnzh8AxW31YEZ3J8bq5G5YthxttRgST",
        "BeTzsKSyvUhYiSrRDrDkZDN69LU4T7Ho3qKmrK8DvxYN",
        "6xASgNpWJzP92LSwWkPZryHt8VMK1XhiU284gkLcVaX1",
        "BNqPhvyoyRz4zj4Mmrc3cdqZaqXjro3RZ82dkvGec38n"
      ]
    },
    ethpow: {
      owners: [
        "0x77021d475E36b3ab1921a0e3A8380f069d3263de"
      ]
    },
    ripple: {
      owners: [
        "rpFXRE1LPyS48a4LMqyksG2sjDg8wmQD5e",
        "rE4y6xhfo9QUV2oAxpHtnVkMmGEk632T7R",
        "rK6enCZ6sMs84wMhTUgLhnPr9eyrTTNA6W",
        "rKK7VZnnqovrh5Gka1ANartX9Usx2aBAZd",
        "rMsmvyJxCRs9csii8yPdd4ti8cLVS4pkAu",
        "r349nPzpVGRFqQKkyvPsbvQdzLRQNfobbk",
        "rHZqS1bfwztYixefmvrbEqn7ZZgjebSphB",
        "rJryAyxLNirDQduAzcQXUHxnBWeKkRKYCU"
      ]
    },
    bsc: {
      owners: [
        "0xc7125DA07a7110049eCC68F43BF10DE4d45CA84e",
        "0x4e67722883AD992182e83b79Bf06A93972963caC"
      ]
    },
    methodology: "This wallets where collect from here https://insights.deribit.com/exchange-updates/proof-of-reserves-deribit/"
  },
  'exmo': {
    bitcoin: "exmo",
    ethereum: {
      owners: [
        "0x112A52893b96E9679E854934A62841051a679dAA",
        "0x6297C8ec7662c10CdACFb3e9C04B571528d277E2"
      ]
    },
    ethereumclassic: {
      owners: [
        "0xD936704458E4f8525B6bE7C0ebC5fE268BaB4977"
      ]
    },
    tron: {
      owners: [
        "TMjqArFD86YDNShnMXSzYqDXKZAphGSJN7"
      ]
    },
    ton: {
      owners: [
        "UQAAdyo7XAGGaNbg7BbHq3XhPXhuFJuX64KStIgOyiFWZiuP"
      ]
    }
  },
  'fastex': {
    ethereum: {
      owners: [
        "0xc21a1d213f64fedea3415737cce2be37eb59be81",
        "0x199BF7d50A4C00dae8395457A507613ae098fF60",
        "0x5C133736f0762bD1Bb21455a10a167A8D2500d1F",
        "0xe851d077836Cc48E4a09B0B4ed984AcBdE358b57",
        "0x2A747aa880138042de556195262f01779d4CFc91",
        "0xb25FfAC8F2dd4696a02c3fE312E1E9c907aF74d5"
      ]
    },
    bitcoin: "fastex",
    tron: {
      owners: [
        "TPj7TCJ9rxdd243yQ3tc7iJzqcEYtupB4v",
        "TXW8f2umgDJhVarwosuGW1d8Wr4FaPpAEb",
        "TDwRF28KJQhcGV46yRDFXgFdcLbztjxVbs"
      ]
    },
    ripple: {
      owners: [
        "rNxBjsC1FsEga35GThyb1KXAyS3kDx8gyv",
        "rMnR4pWoDW2kUSZ7hxnpy2it9ojEdQwc6s"
      ]
    },
    cardano: {
      owners: [
        "addr1q8yrpu5fw3qw62fjezu72pap8munej98zpgmxgrye6rw6nkc65axaph2qhcn9f08edaujlju8uflqpra9sqyz96w7rpqmn48ww"
      ]
    },
    arbitrum: {
      owners: [
        "0xc21A1D213f64FeDEA3415737CCe2BE37Eb59be81"
      ]
    },
    aptos: {
      owners: [
        "0x41a7160155e2d946918fe7969e83f1f70840cf808a7f6e15a18bf6505453ec73"
      ]
    },
    optimism: {
      owners: [
        "0xc21A1D213f64FeDEA3415737CCe2BE37Eb59be81"
      ]
    },
    solana: {
      owners: [
        "BRvrp5WQkVuda1BAxfaBTpbBW4b73GhNp7AW7NcBs596"
      ]
    },
    avax: {
      owners: [
        "0xc21A1D213f64FeDEA3415737CCe2BE37Eb59be81"
      ]
    },
    bsc: {
      owners: [
        "0x85E1De87a7575C6581F7930F857a3813B66A14d8"
      ]
    },
    polkadot: {
      owners: [
        "16iUCscbCHM5mkszPaogRJioxHRbew8YB34nWqsoMkaX1XDZ"
      ]
    },
    ftn: {
      owners: [
        "0xc21A1D213f64FeDEA3415737CCe2BE37Eb59be81"
      ]
    },
    litecoin: {
      owners: [
        "ltc1qy4400xa5r72lsysd7xvjks08r5lrzr5fu0udx7"
      ]
    }
  },
  'fire': {
    ethereum: {
      owners: [
        "0x66A0be112EFE2cc3bc2f09Fa2aCaaf9f593B0265",
        "0xa6F617f873684ED062C9Df281145250b3E4EE2D2"
      ]
    },
    bitcoin: "fire",
    ripple: {
      owners: [
        "r49iM5WS92URBo2w5BFPuKtxNPNTZPCjS2",
        "rhxenffiDqbzaxDtbR9kSEukpjFsA3wvw5"
      ]
    },
    solana: {
      owners: [
        "EXm3bWhUFXpNtvAgnbQyCMtg89NjSwZzme8RCcs7JPCb"
      ]
    },
    cardano: {
      owners: [
        "addr1qxmsmmjh668w66h4xjvrkyl8wkqcpdnpkn5qhv9yuendnfa0stadpn6g73vwrjs06udq2rnmlpr9twejzdrd7nghk5msus5aqd"
      ]
    }
  },
  'grovex': {
    ethereum: {
      owners: [
        "0x79b5a2d395db1711a6e6c42a95eb48710276f666"
      ]
    },
    avax: {
      owners: [
        "0x79b5a2d395db1711a6e6c42a95eb48710276f666"
      ]
    },
    bsc: {
      owners: [
        "0x79b5a2d395db1711a6e6c42a95eb48710276f666"
      ]
    },
    polygon: {
      owners: [
        "0x79b5a2d395db1711a6e6c42a95eb48710276f666"
      ]
    },
    base: {
      owners: [
        "0x79b5a2d395db1711a6e6c42a95eb48710276f666"
      ]
    },
    arbitrum: {
      owners: [
        "0x79b5a2d395db1711a6e6c42a95eb48710276f666"
      ]
    },
    sonic: {
      owners: [
        "0x79b5a2d395db1711a6e6c42a95eb48710276f666"
      ]
    }
  },
  'hashkey': {
    ethereum: {
      owners: [
        "0x5569fd6991d1802dbee9bdd67e763fe7be67c7a9",
        "0xcBEA7739929cc6A2B4e46A1F6D26841D8d668b9E"
      ]
    },
    bitcoin: "hashkey",
    litecoin: {
      owners: [
        "ltc1qzjsgswkenmy9v6vm2jvkddeczwfuy9q7rshtxh",
        "LXeSRVh6WPan3u5AxEZkvvn1srKnN5BiAm"
      ]
    },
    optimism: {
      owners: [
        "0x5691a157ce38f1b362ab4a686ec7616fb04ba6f1",
        "0xC7556Bb9EB188888b1cce25c3587C36Be0809EC4"
      ]
    },
    arbitrum: {
      owners: [
        "0x03248f4759Ef5c4FdDd959aa07a5294e00B03e44",
        "0x25a58cee7928b3d6c1d392ebe1a97318aa5ff2f2"
      ]
    },
    avax: {
      owners: [
        "0x9bc72c8bb18d27bad9d0936be5d5e68fe2d37a29"
      ]
    },
    polygon: {
      owners: [
        "0xAa0400E5a90f697230638DbE76D9C49e4aC745B4"
      ]
    },
    tron: {
      owners: [
        "TYs8Aupg4iXDhifXm1kaCb1MfMcPjLn5RE",
        "TZBcnxpRJcYJkbVMCi6g69BZmTmNACQxpD"
      ]
    },
    bsc: {
      owners: [
        "0x8d13018cf3a136c4c6f6fad37ba880b4677a91d4",
        "0x6a276a58c5194ef196b58442f627dba070cb37bf"
      ]
    },
    solana: {
      owners: [
        "GDui3zpJC1xdnddCM2Vjp5Hnj97pQH1gDAHctyavx5iQ",
        "CrK188sdwoXzMCukUhwDdZmE3fEjsMfESwz8P8o5XbgT"
      ]
    },
    ton: {
      owners: [
        "UQBmo9W_9TZNlVzzH6f_L8CIC4N5GrYs3o8sjUsLXRzLHEU2",
        "UQDxsCGvjT-wPp-R-OePbXl4UwsVZs-02PItnmzaAuUxXAi2"
      ]
    },
    scroll: {
      owners: [
        "0x08c974911e29a7b23899139fb53fdb99aa6cab76",
        "0xdd261309c5b32c006f6ad9a0f16b872392479cdb"
      ]
    }
  },
  'hashkey-exchange': {
    avax: {
      owners: [
        "0xb016ebc8a1440aff7bf098b8f165af65eb898738",
        "0xa108b99c315c22673f7f5b5ca172a21628cf8334",
        "0xB7D06ea243337d98C93c11Fd114cDd50768F264e"
      ]
    },
    bitcoin: "hashkeyExchange",
    ethereum: {
      owners: [
        "0x7ffbafdc1e4f0a4b97130b075fb4a25f807a1807",
        "0xee1bf4d7c53af2beafc7dc1dcea222a8c6d87ad9",
        "0xffe15ff598e719d29dfe5e1d60be1a5521a779ae",
        "0x48ee4a557e291c2a48d227e8a8dbe2217a825682",
        "0x0100dc5672f702e705fc693218a3ad38fed6553d"
      ]
    },
    litecoin: {
      owners: [
        "ltc1qh6w8epz4ycm2smpmnhfauqach28qr4ge6jffyv",
        "LSNjwQ1RGR5rbVDzCwrWiMQF8rdqVRGcPu",
        "ltc1q4qexj7a62h9uxkk0wyt55s0v8qkrc2vqdsnv02"
      ]
    },
    polygon: {
      owners: [
        "0xecd094b51bafbd7bffdf1f4fef067c5d197a1b75",
        "0xee4f6df29617f00b12f85ee56c68962cbeac16aa"
      ]
    },
    doge: {
      owners: [
        "DEovrjDhPB36kwvbyNtiYVrbWv1ahR1jQv",
        "D5qVwCrcNwNFyt4Ju4ASVKxbiYHMnjcGyj",
        "DNq9QyJTg2DTqpBemA66qVtk3VRPR6QpvH"
      ]
    },
    solana: {
      owners: [
        "HwEiRVn4ryKsTq6jECQHepLtUv2GVBfdibC4JjTDj8Su",
        "C9nsmzfv4cjkDJ8CgxSdFZnnRR1MwTyuYr6ip4nL5q3u"
      ]
    },
    ton: {
      owners: [
        "UQDd4CJlAR48mUvAJpPagHqp3AaZOs8st6Vs3tpRLbFuURT4",
        "UQDFHcps8sIKIA8Uts9n33vUhxiTPQFdtPZsGgTUlsWNVFeL"
      ]
    },
    arbitrum: {
      owners: [
        "0xF04671a9Fd6470aA01C35f713C4ae75458920592"
      ]
    },
    optimism: {
      owners: [
        "0x1557601DBA8A9Bbe3a18471A6fdb0416E2db0Ea3"
      ]
    },
    polkadot: {
      owners: [
        "16ceMbQrLZgd9mTyxe72s5KZtUcFcLDx4Kr6diijxVU21RoA"
      ]
    },
    aptos: {
      owners: [
        "0x846763265925e39951ad4f795cae687f9f22466583332f7c9e3ab1943fdad8b8"
      ]
    },
    tron: {
      owners: [
        "TR9ahL7bk9jUKzgsEPdAhssYkKPW6T45N8",
        "TQV6pEPGuyVxjUF6AJRtTELuaXaa9qLnoy"
      ]
    }
  },
  'hibt': {
    ethereum: {
      owners: [
        "0x89a7f48b79516125c5521d5922a6dc0a085b3b95",
        "0x7C32c1b93aC6c9719C9f3c7F8BAAbE502Bbd0F47"
      ]
    },
    bitcoin: "hibt",
    tron: {
      owners: [
        "TWVCro8i15sJjmwRKfV53gPnCsgz2ThQSc",
        "TFBzK6KWDiGMGkcK7mg7YH6Ls2Q4ouDFam",
        "TGoPfFBjoZ6wFFia1NAFio21Pi9Sc8KFw5"
      ]
    }
  },
  'hotbit': {
    bsc: {
      owners: [
        "0xC7029E939075F48fa2D5953381660c7d01570171",
        "0xb18fbfe3d34fdc227eb4508cde437412b6233121",
        "0x768f2a7ccdfde9ebdfd5cea8b635dd590cb3a3f1"
      ]
    },
    ethereum: {
      owners: [
        "0x562680a4dc50ed2f14d75bf31f494cfe0b8d10a1",
        "0xb18fbfe3d34fdc227eb4508cde437412b6233121",
        "0x768f2a7ccdfde9ebdfd5cea8b635dd590cb3a3f1"
      ]
    },
    tron: {
      owners: [
        "TS9b9boewmB6tq874PnVZrKPf4NZw9qHPi",
        "TFPqi7KTRwi2tihwS5dp1QomHowp1x2f45"
      ]
    },
    bitcoin: "hotbit",
    ripple: {
      owners: [
        "rJKBidE4Av6ZaFTBcAucZXCpU7QvNXyfpT"
      ]
    },
    arbitrum: {
      owners: [
        "0xd690a9DfD7e4B02898Cdd1a9E50eD1fd7D3d3442",
        "0x768f2a7ccdfde9ebdfd5cea8b635dd590cb3a3f1",
        "0xb18fbfe3d34fdc227eb4508cde437412b6233121"
      ]
    },
    avax: {
      owners: [
        "0x6C2e8d4F73f6A129843d1b3D2ACAFF1DB22E3366",
        "0x768f2a7ccdfde9ebdfd5cea8b635dd590cb3a3f1",
        "0xb18fbfe3d34fdc227eb4508cde437412b6233121"
      ]
    },
    polygon: {
      owners: [
        "0xb34ed85bc0b9da2fa3c5e5d2f4b24f8ee96ce4e9",
        "0x768f2a7ccdfde9ebdfd5cea8b635dd590cb3a3f1",
        "0xb18fbfe3d34fdc227eb4508cde437412b6233121"
      ]
    },
    optimism: {
      owners: [
        "0xfa6cf22527d88270eea37f45af1808adbf3c1b17",
        "0xb18fbfe3d34fdc227eb4508cde437412b6233121",
        "0x768f2a7ccdfde9ebdfd5cea8b635dd590cb3a3f1"
      ]
    },
    fantom: {
      owners: [
        "0xc62A0781934744E05927ceABB94a3043CdCfEA89",
        "0x768f2a7ccdfde9ebdfd5cea8b635dd590cb3a3f1",
        "0xb18fbfe3d34fdc227eb4508cde437412b6233121"
      ]
    },
    eos: {
      owners: [
        "hotbitioeoss",
        "hotbitioeos2"
      ]
    },
    cronos: {
      owners: [
        "0x768f2a7ccdfde9ebdfd5cea8b635dd590cb3a3f1",
        "0x4b81c7Ff6912856AFBb40ACb32084A41F019B433",
        "0xb18fbfe3d34fdc227eb4508cde437412b6233121"
      ]
    },
    methodology: "We have collect this wallets from Hotbit Team on the 14/12/22 and added more on the 09/02/2023. We are not counting money in defi Protocols. In this case around $3.1m in Curve (Ethereum chain), around $1.1m in Convex, $1.6m in BendDAO, $960k in PancakeSwap (BSC Chain), $650k in Beefy, $230K in AutoFarm. We are also not counting around $622km in the Telcoin (Polygon) and $516k in Sandbox. We are also not counting around $975k in Wonderland (Avax) and $385k on Homora V2. We are also not counting $624k in Alpaca Finance (Fantom). We may also not count a few small token balances and other small amounts in defi Protocols. This data was collected on 19/04/23"
  },
  'hotcoin': {
    ethereum: {
      owners: [
        "0x10b620f9720C0c6460484A81C59a6297Fa48F817",
        "0xbB916e1E722f69d9fdFE6805f3dEDD51353f8E55",
        "0x5B5627C9686c5744534C8aa7d9C312DA88794b8E"
      ]
    },
    tron: {
      owners: [
        "TDZu7rwKeMrcXQRfmzA2fQUb1bCYUoJfPw",
        "TDVBTADNXp7PuLLXdHyLn1v96Q2Kx1GKYE",
        "TXNUMHHvazAEPyjECzAqVrnCwJV559ijYv"
      ]
    },
    bitcoin: "hotcoin",
    scroll: {
      owners: [
        "0xB54259245da3578C02591565Fa88a678aD542146"
      ]
    },
    optimism: {
      owners: [
        "0x1Fa51b8A412b32FB7e4C25082471214f22D0c9D9"
      ]
    },
    op_bnb: {
      owners: [
        "0x84B13Be1968cE1caEE7431BD6f84CB2EBc7F8325"
      ]
    },
    solana: {
      owners: [
        "78TDoKGTeS7RRoqUrSijS1QVFVmxJvwE2NxYicHFHh3N"
      ]
    },
    arbitrum: {
      owners: [
        "0xc2997c47ff647Db91092Cf0ad184E91FB5F80D6F"
      ]
    },
    polygon: {
      owners: [
        "0x72a73dC55a7038cb4707F2a23aC2AE705A8Fa888"
      ]
    },
    bsc: {
      owners: [
        "0xa1ab382330d6b7a99ee3441e6594e49790294e4e",
        "0xDCd7eFd91A6afD14168352023fCC8939601ea0bc",
        "0x6EDA9105761B840F9D24d34Ab1dC28629EcC35fd"
      ]
    }
  },
  'klever-exchange': {
    ethereum: {
      owners: [
        "0x5a57cfafe8b9e94419cc7d0cb1f4a95c73f40110",
        "0x4a5f98e2c2784d359fc0decc8533ae27af0e5974",
        "0x5af8da2675dd31beffa2619145957b15e8013f37",
        "0x91af50adb57283283c8b442622e95c26d46d911c",
        "0x96c38eeed002d3df2e369deffe6cc84688eadb01"
      ]
    },
    tron: {
      owners: [
        "TKM9AYxWxRe7hESuWmKFXwcDjnb5cQK92E",
        "TMp2qThJSRZbmvFQwuRjyoL8ygykqMZDEo",
        "TPYcvyecPr5TAXRUSjKu2iNJuG6dNHxri3"
      ]
    },
    bitcoin: "kleverExchange"
  },
  'korbit': {
    ethereum: {
      owners: [
        "0x0c01089AEdc45Ab0F43467CCeCA6B4d3E4170bEa",
        "0x2864DE013415B6c2C7A96333183B20f0F9cC7532",
        "0x8550E644D74536f1DF38B17D5F69aa1BFe28aE86",
        "0xd03be958e6b8da2d28ac8231a2291d6e4f0a7ea7",
        "0xd6e0F7dA4480b3AD7A2C8b31bc5a19325355CA15",
        "0xe5d7ccc5fc3b3216c4dff3a59442f1d83038468c",
        "0xe83a48cae4d7120e8ba1c2e0409568ffba532e87",
        "0xf0bc8FdDB1F358cEf470D63F96aE65B1D7914953"
      ]
    },
    bitcoin: "korbit",
    ripple: {
      owners: [
        "r9WGxuEbUSh3ziYt34mBRViPbqVxZmwsu3",
        "rGU8q9qNCCQG2eMgJpLJJ1YFF5JAbntqau",
        "rGq74nAmw1ARejUNLYEBGxiQBaoNtryEe9",
        "rJRarS792K6LTqHsFkZGzM1Ue6G8jZ2AfK",
        "rNWWbLxbZRKd51NNZCEjoSNovrrx7yiPyt",
        "rsYFhEk4uFvwvvKJomHL7KhdF29r2sw9KD"
      ]
    }
  },
  'kraken': {
    ethereum: {
      owners: [
        "0x2910543af39aba0cd09dbb2d50200b3e800a63d2",
        "0xae2d4617c862309a3d75a0ffb358c7a5009c673f",
        "0x43984d578803891dfa9706bdeee6078d80cfc79e",
        "0x66c57bf505a85a74609d2c83e94aabb26d691e1f",
        "0xda9dfa130df4de4673b89022ee50ff26f6ea73cf",
        "0xa83b11093c858c86321fbc4c20fe82cdbd58e09e",
        "0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13",
        "0xe853c56864a2ebe4576a807d26fdc4a0ada51919",
        "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0",
        "0xfa52274dd61e1643d2205169732f29114bc240b3",
        "0x53d284357ec70ce289d6d64134dfac8e511c8a3d",
        "0x89e51fA8CA5D66cd220bAed62ED01e8951aa7c40",
        "0xc6bed363b30df7f35b601a5547fe56cd31ec63da",
        "0x29728d0efd284d85187362faa2d4d76c2cfc2612",
        "0xe9f7eCAe3A53D2A67105292894676b00d1FaB785"
      ]
    },
    bitcoin: "kraken",
    starknet: {
      owners: [
        "0x620102ea610be8518125cf2de850d0c4f5d0c5d81f969cff666fb53b05042d2"
      ]
    }
  },
  'lbank-exchange': {
    ethereum: {
      owners: [
        "0xfa9f7a1cBfBCB688729c522b4F0905CcF4d26D25"
      ]
    },
    bitcoin: "lbank"
  },
  'levex': {
    bsc: {
      owners: [
        "0x03bd8283b68af907e2e5d6ff3ae2617c00a1d717",
        "0x247ee531ea21f7b182dcfe5ef3ee6abedb4f086c"
      ]
    },
    arbitrum: {
      owners: [
        "0x03bd8283b68af907e2e5d6ff3ae2617c00a1d717"
      ]
    },
    ethereum: {
      owners: [
        "0x03bd8283b68af907e2e5d6ff3ae2617c00a1d717",
        "0xa7c23c824fa730065ab9367947cc139687536284",
        "0xd7b73e4f5f373ef11bb4a22f7e8d2b4db051fbfb",
        "0x0070fb0677edb8b6e61ce6f5976c32e99d74be13",
        "0x9c9c67578d746595c0e331e13f9b378326569c56"
      ]
    },
    polygon: {
      owners: [
        "0x03bd8283b68af907e2e5d6ff3ae2617c00a1d717"
      ]
    },
    base: {
      owners: [
        "0x03bd8283b68af907e2e5d6ff3ae2617c00a1d717"
      ]
    },
    optimism: {
      owners: [
        "0x03bd8283b68af907e2e5d6ff3ae2617c00a1d717"
      ]
    },
    avax: {
      owners: [
        "0x03bd8283b68af907e2e5d6ff3ae2617c00a1d717"
      ]
    },
    bitcoin: {
      owners: [
        "bc1qpcae7ucadgf5mj4ntn36xnr6rv39why6yf3l7t",
        "bc1qpfwp4u3qxljq25hs5ewgqqzdexvx5sqhsk4geg",
        "bc1q33493ufeq3wrn8ur30gehgnnaqduemfnkt60pa"
      ]
    },
    ton: {
      owners: [
        "UQAy9dYvynVbnkbv5hynU2456gFGCqNXth7ldjTLsQ1KmsOV"
      ]
    },
    solana: {
      owners: [
        "BLGFthn7CqHsJHkucwiBWyv1BruRYszfmdW5Xg8dFT3m"
      ]
    },
    methodology: "We have collect this wallets from https://levex.com/en/assets/proof-of-reserve."
  },
  'maskex': {
    ethereum: {
      owners: [
        "0x09b1806df13062b5f653beda6998972cabcf7009",
        "0x0c78fd926a8fc9cfc682bdc6b411942d9c7edb7a",
        "0x0feabb61f67e859811aafce83a5ab780f8c53c0a",
        "0x33fe5557e90a872a065f2acfd973847e33fc4532",
        "0x6f531cf07f2d659dcfb371b1a7f4c0157a168332",
        "0x71467da4c0b0db4e889da703e6ff1cd740f1f74a",
        "0x7ac724cac6e4ddc24c102b1006f41bc8a6a5c1c5",
        "0x7e0616656934a09373b1e1114de2c20a77513d16",
        "0x80b62f0ea7a89bbc4df4c95e2ad363e5c153b80e",
        "0x823c8e533657b0004b5ab8553d84502ba2e571f7",
        "0x833f3b6faa717079fb3a1030f6207c57b1c591bd",
        "0x9f1bb5349d481065561a84cbd7f84982fd533359",
        "0xA310b3eecA53B9C115af529faF92Bb5ca4B41494",
        "0xa4E71851A8c8eaeFeb20A994159F4A443E46059b",
        "0xbe921ea3bd0c879a8688b7fabe6b3c8a471df90d",
        "0xc3edbb9c181016cef5d76491f835930e9c8c4d2c",
        "0xdd9c649edb7ff80c6c9d238344260184a4f94b88",
        "0xfb65377800a7282cf81baf0f335fbc6f8ff36776",
        "0x0ce7eefb9f862aa0374ee7bbc4d8a0fc2c651517",
        "0x0ce92d3a15908b53371ff1afcae800f28142250c",
        "0x95ad8841376058a000F489196F05ecf176bEB8ac",
        "0x0B3c7bcE764E6f1B52443e30fcb4f34997A0674c"
      ]
    },
    bsc: {
      owners: [
        "0x1349907c197731c5ed98d8442309a15107cb6bad",
        "0x2161217d22fac0188775432f8ba32f1d4272dd19",
        "0x3dd878a95dcaef2800cd57bb065b5e8f2f438131",
        "0x46c75fc52e0263946f8f1a75a95c23a767d2f26e",
        "0x6e2673095545280f6f10e22eb861a555c6e94bec",
        "0x84457412efe8b3a05583cb496e1d2c03e6f36155",
        "0x8458c828d602230e92eb0aac5a6aed5580011b6a",
        "0xA310b3eecA53B9C115af529faF92Bb5ca4B41494",
        "0xa4E71851A8c8eaeFeb20A994159F4A443E46059b",
        "0xc6acb77befebff0359cc581973859eee8cbaeda1",
        "0xd666ad8d95903bce9b4dcd2cacde5145e36405c2",
        "0xd7aed730a7c4cf8dfe313b16712af3406f6dca5b",
        "0x6db133e840376555a5ad5c1d7616872ef57e7f13",
        "0xDCa6951B82e82AF6AAB4bB9e90CA00F5760370e1"
      ]
    },
    tron: {
      owners: [
        "TAv486fty6xRuWHQfhBiMh4jBofSuXJcpV",
        "TDQ7nxDTJBMZkkWcFZKs9KdWzb2vT2drDu",
        "TKCbzA6HPnwEDL9M2tAWnqsbD6TXLUD7yy",
        "TLqPRfPHieHsMMFaQSMXoXqWD18C97cFqB",
        "TSFvf8LZuwy4BKNPdULFD5vaCFMrkiGRme",
        "TW6DLBY5dyCUVzc3sgKV72HXNT8EkmEUT8",
        "TXiZ9ddXTBUke9PDs5HLXVvvHY68kmC3me"
      ]
    },
    bitcoin: "maskex"
  },
  'mt-gox': {
    bitcoin: "mtGox"
  },
  'nbx': {
    ethereum: {
      owners: [
        "0x29af949c3D218C1133bD16257ed029E92deFb168",
        "0x8Cad96fB23924Ebc37b8CdAFa8400AD856fE4a2C",
        "0xAeB81c391Ac427B6443310fF1cB73a21E071e5ad"
      ]
    },
    cardano: {
      owners: [
        "addr1q9phfjzqhcndne6chkxvtwt209n4335ghy0389mp5jfh3gyhry659z5gnwn04r2as2hy9m4uuqvlhjm0gm7r9dd7j65s7tsfxa",
        "addr1qywum3fvtfrw4t52xk6y2ls9dsgkgwk759fxrnpae7f4q5d3uk2aw97ypjvvf3kjy43pl4axma6c4sjadq2lwlx80tus3k4j0v"
      ]
    },
    bitcoin: "nbx"
  },
  'nexo-cex': {
    ethereum: {
      owners: [
        "0x8fd589aa8bfa402156a6d1ad323fec0ecee50d9d",
        "0xb60c61dbb7456f024f9338c739b02be68e3f545c",
        "0x57793e249825492212de2aa4306379017301e1da",
        "0x9bdb521a97e95177bf252c253e256a60c3e14447",
        "0xffec0067f5a79cff07527f63d83dd5462ccf8ba4",
        "0x55e4d16f9c3041eff17ca32850662f3e9dddbce7",
        "0x7344e478574acbe6dac9de1077430139e17eec3d",
        "0x6914fc70fac4cab20a8922e900c4ba57feecf8e1",
        "0xf36a47300f002c0c9f8c131962f077c3543b2fc6",
        "0x7ab6c736baf1dac266aab43884d82974a9adcccf",
        "0xa75ede99f376dd47f3993bc77037f61b5737c6ea",
        "0x65b0bf8ee4947edd2a500d74e50a3d757dc79de0",
        "0x0031e147a79c45f24319dc02ca860cb6142fcba1",
        "0x00ee047a66d5cff27587a61559138c26b62f7ceb",
        "0x354e9fa5c6ee7e6092158a8c1b203ccac932d66d",
        "0xba90b5bc12daab8d06582967a22c86ae7eed0469"
      ]
    },
    polygon: {
      owners: [
        "0xb60c61dbb7456f024f9338c739b02be68e3f545c",
        "0x9bdb521a97e95177bf252c253e256a60c3e14447",
        "0x7344e478574acbe6dac9de1077430139e17eec3d",
        "0x6914fc70fac4cab20a8922e900c4ba57feecf8e1",
        "0x7ab6c736baf1dac266aab43884d82974a9adcccf",
        "0xa75ede99f376dd47f3993bc77037f61b5737c6ea"
      ]
    },
    bsc: {
      owners: [
        "0xb60c61dbb7456f024f9338c739b02be68e3f545c",
        "0x9bdb521a97e95177bf252c253e256a60c3e14447",
        "0x55e4d16f9c3041eff17ca32850662f3e9dddbce7",
        "0x7344e478574acbe6dac9de1077430139e17eec3d",
        "0x6914fc70fac4cab20a8922e900c4ba57feecf8e1",
        "0xf36a47300f002c0c9f8c131962f077c3543b2fc6",
        "0x7ab6c736baf1dac266aab43884d82974a9adcccf",
        "0xa75ede99f376dd47f3993bc77037f61b5737c6ea"
      ]
    },
    fantom: {
      owners: [
        "0xb60c61dbb7456f024f9338c739b02be68e3f545c",
        "0x9bdb521a97e95177bf252c253e256a60c3e14447",
        "0x6914fc70fac4cab20a8922e900c4ba57feecf8e1",
        "0xa75ede99f376dd47f3993bc77037f61b5737c6ea"
      ]
    },
    avax: {
      owners: [
        "0xb60c61dbb7456f024f9338c739b02be68e3f545c",
        "0x9bdb521a97e95177bf252c253e256a60c3e14447",
        "0x6914fc70fac4cab20a8922e900c4ba57feecf8e1",
        "0xa75ede99f376dd47f3993bc77037f61b5737c6ea"
      ]
    },
    optimism: {
      owners: [
        "0x7344e478574acbe6dac9de1077430139e17eec3d",
        "0x6914fc70fac4cab20a8922e900c4ba57feecf8e1"
      ]
    },
    arbitrum: {
      owners: [
        "0x6914fc70fac4cab20a8922e900c4ba57feecf8e1"
      ]
    },
    methodology: "We are not counting money in defi Protocols. In this case around $1.49m in AAVE (Ethereum and polygon network), around $2.4m into notional (Ethereum network), around $660k into beethoven (Fantom network), around $130k into Harvest (BSC chain). We may also not counting a few small token balances. This data was collected on 14/01/2023 "
  },
  'niza': {
    ethereum: {
      owners: [
        "0x8374F37B298420ae13ccD3cbE7dC07895290676d"
      ]
    },
    bitcoin: {
      owners: [
        "bc1qx2p4hx3s60cg69rt3j78l2vskelgcjj95s5ty3"
      ]
    }
  },
  'okcoin': {
    ethereum: {
      owners: [
        "0xd30b438df65f4f788563b2b3611bd6059bff4ad9",
        "0x4a8f1f5b2a3652131eac54a6f183a4a2cf44a9a6",
        "0x2ce910fbba65b454bbaf6a18c952a70f3bcd8299",
        "0xa28062bd708ce49e9311d6293def7df63f2b0816",
        "0x964b78ef2925f24c3a8d270c10522638dee5f17f",
        "0xd7efcbb86efdd9e8de014dafa5944aae36e817e4"
      ]
    },
    bitcoin: "okcoin",
    tron: {
      owners: [
        "TQ7wK19fhZZqLdj2Xcw2e6Ejs3cTZbfBbF"
      ]
    },
    avax: {
      owners: [
        "0x5793da1b0c41c7db8e3eb8dbcd18fdca94a58535"
      ]
    },
    polygon: {
      owners: [
        "0x0f51a310a4dd79d373eb8be1c0ddd54570235443"
      ]
    },
    okexchain: {
      owners: [
        "0x5b73841a54f6f2e8b179f1801f664f470d7f37ea"
      ]
    },
    methodology: "This wallets where collect from here https://www.okcoin.com/proof-of-reserves/download Audit ID 500509486 , 06/08/2023, 19:00:00. We are only tracking BTC wallets with more than 0.1 BTC. We are only tracking ETH wallets with more than 100$."
  },
  'orangex-cex': {
    bitcoin: "orangex",
    ethereum: {
      owners: [
        "0xaefac73a5109c17f5c8ce3fefa58df605561fdcb",
        "0xfe2967c2957dc00d46563b01591c9a5c8db08394",
        "0xaefac73a5109c17f5c8ce3fefa58df605561fdcb",
        "0xfe2967c2957dc00d46563b01591c9a5c8db08394"
      ]
    }
  },
  'ourbit': {
    ethereum: {
      owners: [
        "0xf81b45b1663b7ea8716c74796d99bbe4ea26f488",
        "0x18D080B89570e4B996EB17fA1F0206F0CE35d604"
      ]
    },
    tron: {
      owners: [
        "TApNqy5BNx11TiNa7oibbBUV63BY5a2sNE",
        "TJP6zoGwWwUmANvMdrtqYq9iWA8qMAAY4q"
      ]
    },
    bsc: {
      owners: [
        "0xdbf7122c0b7af893580df087eabac0b3be3e9483",
        "0x6c6EC4beeAa53171a0ce0691D5c9A5FaAF509a8A"
      ]
    },
    optimism: {
      owners: [
        "0x944d6b4c2bf808f9324ca0675f1d7e0e92a35436"
      ]
    },
    avax: {
      owners: [
        "0x8fc27c899fb2c1044608516450e385378195639d"
      ]
    },
    arbitrum: {
      owners: [
        "0x040432c11ee833bdcaac2495329b65bee7cca6d9"
      ]
    },
    solana: {
      owners: [
        "7UhjbynicBP8rqcobwsAJDfRMjwgHSgdxcYNJmLwxfms",
        "3pjwKq9yuzpVYfD4h5jMZLLfV8oSd8YiwpoAaB5oZS3H"
      ]
    },
    bitcoin: {
      owners: [
        "bc1q2cvpg2c74puqke4py0ufr0aauj4m5vdeaqpjxv"
      ]
    }
  },
  'p2pb2b': {
    bitcoin: "p2pb2b",
    ethereum: {
      owners: [
        "0xcfed1443a1ed773119ed1a41a39b3b66f0ffde0f",
        "0x302f4d246fc1E283AF3239311B8B84bD5a1c7736",
        "0x03feA254cfA7434004E8d495725bCbB7cCc40454",
        "0x7a2556e23ce7bc1ADFBDCa650130390A10C05f63",
        "0x2f16A452999933c23005439CEF49Ce3259Eb73C3"
      ]
    },
    bsc: {
      owners: [
        "0x83455d6c365dcbac10855c623da884b552aaefdd",
        "0x03feA254cfA7434004E8d495725bCbB7cCc40454",
        "0x2f16A452999933c23005439CEF49Ce3259Eb73C3"
      ]
    },
    polygon: {
      owners: [
        "0x302f4d246fc1E283AF3239311B8B84bD5a1c7736",
        "0x2f16A452999933c23005439CEF49Ce3259Eb73C3"
      ]
    },
    methodology: "We are only tracking part of their cold wallets for P2PB2B, more information here https://coinmarketcap.com/exchanges/p2b/"
  },
  'pionex-cex': {
    ethereum: {
      owners: [
        "0xf6d4e5a7c5215f91f59a95065190cca24bf64554",
        "0x2a8a276019d3ec549ae657c945ef60aab4e33c9b",
        "0xa008dc1281aa6bff98b2c253ee8fd759ba918103",
        "0x28410a70acc5f01e4efe892bcc38b70f3bcf014b",
        "0x4608fbf5fd78879ba0a75c6c0b0f5e53e188d3e2",
        "0x5e483d7803a8b39f0d6792a0431176a91fde6e31",
        "0x7175a01564ac4a83dd396e288a2707dee86caf63",
        "0x4998cb57364531560f4048213ba9b529ec27f14f",
        "0x02104cae462af17739cc4315ef9ac710a9ed22a7",
        "0x3c22c17501047d862b3a98e296079966aefd8df7",
        "0xbbb72ba600d8493fea284d5fe44919f7b60d53f5",
        "0x67be8ce27ef8158d51d8593bb5b26eafacc955d9"
      ]
    },
    bitcoin: "pionexCex",
    tron: {
      owners: [
        "TYULGbfdheMSQBv7skFxNbgo7mbNjsWSrF",
        "TDr8tDBgYLtrfPmC4erXp7eRgvVNM32EKp",
        "TQZPjLBwG8JW7J8LJ3vBbXU6UxAyxH1367",
        "TDe3wqxhTSPimeQkJVKNBkCjRnUj839MKj",
        "TGMX4ipWLrjqZq7yM4cGVNr124BFrRYtWz",
        "TJZj4RS6v6U3HCpTSJ7CwNycRcoi7BREGx",
        "TLK8GVBqJNmcyaN5mpSPSzQfTjsSxb7sC9",
        "TGgMNPxdyUgdYwMSbMkpTPvaSkrRakKqcK",
        "TAA7sxJ259JgstGPjanb5sB6ZJuCPtCobs",
        "TKRksVBKDBATKcifm4FXFHcD1FmJQ2bp3x"
      ]
    },
    solana: {
      owners: [
        "DGFW1Effv88XzXkgfgyoFfmefzEU5Pp9zWJACBmCSh8K",
        "FXv8hUveo3Di254W5vycvouxrmTJG4oQ5QMm1tLhY3NF"
      ]
    },
    bsc: {
      owners: [
        "0xF6D4E5a7c5215F91f59a95065190CCa24bf64554",
        "0x67be8ce27ef8158d51d8593bb5b26eafacc955d9"
      ]
    },
    optimism: {
      owners: [
        "0xF6D4E5a7c5215F91f59a95065190CCa24bf64554"
      ]
    },
    arbitrum: {
      owners: [
        "0xF6D4E5a7c5215F91f59a95065190CCa24bf64554",
        "0x67be8ce27ef8158d51d8593bb5b26eafacc955d9"
      ]
    },
    avax: {
      owners: [
        "0xF6D4E5a7c5215F91f59a95065190CCa24bf64554"
      ]
    }
  },
  'poloniex-cex': {
    bitcoin: "poloniex-cex",
    ethereum: {
      owners: [
        "0x8fca4ade3a517133ff23ca55cdaea29c78c990b8",
        "0x29065a4c1f2f20d1e263930088890d6f49fe715a",
        "0x176f3dab24a159341c0509bb36b833e7fdd0a132"
      ]
    },
    ripple: {
      owners: [
        "rwJXYKC1VMzGYc6RHnhnbe38syj5EE34cS",
        "rKv1CcnLFSjQ7ecowP8QpsHy3cMyNaC2ku",
        "rUYkx2mGm1m4wH75cgedu79vshbfDFUWj8"
      ]
    },
    tron: {
      owners: [
        "TWhDfwC8QE6pQyiYy248dNor3uphPEw5M2",
        "TSzSgxRisS5VBXXDcAezTDvnPGi9CbsXvJ",
        "TUgSgCQL6pMSy9zByn4sgxqrJa95sZExBG"
      ]
    },
    stellar: {
      owners: [
        "GCOND2ZGWNMSHNIHU24HBJAKYM6H2G6FYN5NRQ46BP6G7MZSO5IM2JEJ",
        "GCNFBPRT75HFWJJ45JUUVZKXKXNISW5H5OKLTZMZ6WLC4BINAGRJWAOU",
        "GCGXQEUNC6NFQYXH7AYK7LJKKDZHHEV2XM72NFNQ6ZI4CGNQJIKFHWWM"
      ]
    },
    solana: {
      owners: [
        "7Ci23i82UMa8RpfVbdMjTytiDi2VoZS8uLyHhZBV2Qy7",
        "Eueeb9FKXpk7duw7jKeYm1NNWmTeFN7fGKYMmasY7C9x",
        "31KVUP9uPsdUniHkSKDtsDqB1VksmKskreynTQ3xitKz"
      ]
    },
    ethereumclassic: {
      owners: [
        "0xc921bea90897596bf281e81bd329fa5f56b794ac",
        "0xbad1216f81caec7fb557f30c410187d66ee374b9",
        "0xBcEb3318d34a59FD1b91540E8EaDeD28aF6d249c"
      ]
    },
    polygon: {
      owners: [
        "0xcc0c098f170281810966b4133c794cb91c5587b2",
        "0x12a17c12d4db72e7c3d8f8ce10080904300086cd",
        "0x176f3dab24a159341c0509bb36b833e7fdd0a132"
      ]
    },
    arbitrum: {
      owners: [
        "0x920021936b28c93491a02f760fa20aa599083ed5",
        "0x126a65dd631eea1f6b2ce43288ca50aa771521ec",
        "0x176f3dab24a159341c0509bb36b833e7fdd0a132"
      ]
    },
    optimism: {
      owners: [
        "0x9f73a5a60e9a9c063bcc30631dbb738312145113",
        "0x1c8fdd3560748c1ff1b22dde7e025625629bdcc0",
        "0x176f3dab24a159341c0509bb36b833e7fdd0a132"
      ]
    },
    cardano: {
      owners: [
        "addr1vxn9jr4ewahttr8wd8d2a4n2jq96crcje0c8402s9spzppqgmv9hu",
        "addr1qy7kcd0qrvc5t6mqqacz8ta5jc9an6xj4uqavreey3gf45pads67qxe3gh4kqpmsywhmf9stm85d9tcp6c8njfzsntgqxsu4m8",
        "addr1qxyl2w9m3le06ap89j089tm90ks4xttscmz5yup4rupg7jnp2e4cx2g5aznrx754xufx4c63sz0rp2u3em6wktk8sp0qxrsrjl"
      ]
    }
  },
  'probit': {
    ethereum: {
      owners: [
        "0x72e5263ff33d2494692d7f94a758aa9f82062f73",
        "0xaD285fDEDFC0D5f944A33e478356524293c7eC68",
        "0xf71afe21cd32959113fc47ae2ef886b43a9413d5"
      ]
    },
    bsc: {
      owners: [
        "0xd6a4452eebde830888cee4a395126831ab16250c",
        "0xf4be044ba7461d8444ed53f9ec7490781e08e3b7",
        "0x898fce2414a1347c0e12bde6b28b75843fd9bbad"
      ]
    },
    bitcoin: "probit",
    fantom: {
      owners: [
        "0xc78600a92caf0fcf6990e7ea7381bf4297054f86",
        "0x06ffd89a07b078d4a1a1d9947a28e95825f9c35c",
        "0x813e711993fc8ec29e9e45fb3a7e47f8c33ca64f"
      ]
    },
    polygon: {
      owners: [
        "0xfaef9cc9bf46c386c58a3e86ffffbf77969ca149",
        "0x29b6e9abf51fc7d4581f6cbd1a9d5392fa7fa78f",
        "0xdba24f19bce0f32ea4273faea7c01d7f9d4f91d6"
      ]
    },
    tron: {
      owners: [
        "TPkn5zpxXr8jaNqvgVoFanTsvXCbNXJ8GB",
        "TGEwJxVErWagXnriZATPMBFFbbeuad9m3h",
        "TYiFSQG4dfdWh8RWETsvJn4fvXdZ8bEL7t"
      ]
    },
    ripple: {
      owners: [
        "rwXEHNNuf3nctzXLtvL5JnQJGMyUZYGrVc",
        "rsA9ijHjo7hAkitc9GsXsiwXzqGs7eoeqr",
        "rEa9cAYavjfxvmdJExr1PMGxoPYzAUZXGb"
      ]
    },
    solana: {
      owners: [
        "BX145kKanqBmeud72ir44iMFVAfaak4y933rgbMc2H52",
        "FavWP1KXVVNZLTYjfSBWPanxbVeCW4A3pJ96hn2GRWGR"
      ]
    }
  },
  'robinhood': {
    ethereum: {
      owners: [
        "0x6081258689a75d253d87cE902A8de3887239Fe80",
        "0x40b38765696e3d5d8d9d834d8aad4bb6e418e489"
      ]
    },
    bitcoin: "robinhood",
    polygon: {
      owners: [
        "0x6081258689a75d253d87cE902A8de3887239Fe80"
      ]
    },
    avax: {
      owners: [
        "0x6081258689a75d253d87cE902A8de3887239Fe80",
        "0x40b38765696e3d5d8d9d834d8aad4bb6e418e489"
      ]
    }
  },
  'sclite': {
    ethereum: {
      owners: [
        "0x81F2b5344d1714072DD566cF3E27C733B17065F5",
        "0x444A16E4232a1d791C4afd7dd509ef33D81E66e8",
        "0x1394a1981363add085084227dce872e202565580",
        "0x04dc6ae5c461cee89f84951a49f9b3fcc31c014f",
        "0xe3726d56bf5625f8dc1acc6483c4957511ab61a5",
        "0xe56b2f3e769b8b27ee75fc2cb0146ee4156fd268"
      ]
    },
    bsc: {
      owners: [
        "0x81F2b5344d1714072DD566cF3E27C733B17065F5",
        "0x444A16E4232a1d791C4afd7dd509ef33D81E66e8",
        "0x1394a1981363add085084227dce872e202565580",
        "0x04dc6ae5c461cee89f84951a49f9b3fcc31c014f",
        "0xe3726d56bf5625f8dc1acc6483c4957511ab61a5",
        "0xe56b2f3e769b8b27ee75fc2cb0146ee4156fd268"
      ]
    },
    polygon: {
      owners: [
        "0x81F2b5344d1714072DD566cF3E27C733B17065F5",
        "0x444A16E4232a1d791C4afd7dd509ef33D81E66e8",
        "0x1394a1981363add085084227dce872e202565580",
        "0x04dc6ae5c461cee89f84951a49f9b3fcc31c014f",
        "0xe3726d56bf5625f8dc1acc6483c4957511ab61a5",
        "0xe56b2f3e769b8b27ee75fc2cb0146ee4156fd268"
      ]
    },
    tron: {
      owners: [
        "TQWHhijq5CrfKt8LGqsaqqz8TzMR1VY5rP"
      ]
    },
    bcypher: {
      owners: [
        "0x81F2b5344d1714072DD566cF3E27C733B17065F5",
        "0x444A16E4232a1d791C4afd7dd509ef33D81E66e8",
        "0x1394a1981363add085084227dce872e202565580",
        "0x04dc6ae5c461cee89f84951a49f9b3fcc31c014f",
        "0xe3726d56bf5625f8dc1acc6483c4957511ab61a5",
        "0xe56b2f3e769b8b27ee75fc2cb0146ee4156fd268"
      ]
    }
  },
  'silkroad-fbifunds': {
    bitcoin: "silkroad"
  },
  'tapbit-cex': {
    ethereum: {
      owners: [
        "0x33b9b598fb490f17426da7b7d344ead1bc3915dd"
      ]
    },
    bitcoin: "tapbit"
  },
  'toobit': {
    ethereum: {
      owners: [
        "0xCAF80cfacBEF94d37De091093822f2a862adc47F",
        "0x3244609ee06ae8f403003c624314e50e6c2ac01a"
      ]
    },
    bitcoin: "toobit",
    bsc: {
      owners: [
        "0xCAF80cfacBEF94d37De091093822f2a862adc47F"
      ]
    }
  },
  'TradeOgre': {
    avax: {
      owners: [
        "0x4648451b5f87ff8f0f7d622bd40574bb97e25980"
      ]
    },
    bsc: {
      owners: [
        "0x4648451b5f87ff8f0f7d622bd40574bb97e25980"
      ]
    },
    ethereum: {
      owners: [
        "0x4648451b5f87ff8f0f7d622bd40574bb97e25980"
      ]
    },
    polygon: {
      owners: [
        "0x4648451b5f87ff8f0f7d622bd40574bb97e25980"
      ]
    },
    ripple: {
      owners: [
        "rhsZa1NR9GqA7NtQjDe5HtYWZxPAZ4oGrE"
      ]
    },
    tron: {
      owners: [
        "TBQc1xRWp2G6iUQTD51Lczrk7zbjTRoGRE"
      ]
    },
    methodology: "All reserves information can be found on block explorers."
  },
  'valr-cex': {
    bitcoin: {
      owners: [
        "3PUAxZ26mF8Ub1oQrc7TK7NvTe93KaNQZP",
        "bc1q068k89wp2dt3v7wrp8uyscd3llvz6tytz3ve8pd4e2f6z9a5kdjqtqe505"
      ]
    },
    ethereum: {
      owners: [
        "0x7ce3ec6845780e8f69b1a19edf8148d7cbb77a7d",
        "0x556C26A8d2a27e1e50Ee7D72b1938f9D794FaAe7",
        "0x05CdB1526F6e224e02919a4C018D9784Ea25eb3d",
        "0x630910471EFf63C5fbD1fDFf745BE3851d341Cb8"
      ]
    },
    avax: {
      owners: [
        "0x05CdB1526F6e224e02919a4C018D9784Ea25eb3d",
        "0xb1FB90a68E5C04284B2863e3b1dbDa1aeC5E8E48",
        "0xadE4a6383A3339c3Fbde1BDa1829b73CD3374C43",
        "0x92a8e66c04D70290Ad8520A87e1639b6c99A0fF3",
        "0x8D23DC08E5774118A5E3E226c9233E94E48c4d1f",
        "0x0d1098C86b8BA34388b6fF0777F3F7227274F5cE",
        "0xAae5423207e6BD963115Fd1611888eFdC3E63CB1",
        "0xFFe462Bf5a47552073fC5004845cA004809EA8d0",
        "0x803887E0385A90e59198F4c124343dD77d5e3c4B",
        "0x61ed356539542a2795fAF530cd113241FbDf8FA2",
        "0x10C3ab1264DA2e9c8b349785a45742956878456b"
      ]
    },
    solana: {
      owners: [
        "HA9oNhHddEoPFSAEEYtGYZoXDkjky53TQ72jtpAnu81i",
        "5iFZsZsBxw8AyMAHeukgy9RktwyiyBYLDM1GEvQqY37N",
        "x8upN44MffTHxbdWLuR9q1U1B7eDPpHLUncessPWkCx",
        "DyUJQ3JyhN7UB6PEbVoE3769Djf68aS9JWqQpxfXy3AY",
        "6d6sZPUcK1DgVg6uBBYJuPsHTYV3gLvXeYkD5tSXCs2u",
        "E4JTRq3L8JeURjvursNEgc8EupPWZRYitpi6EW5YGzK5",
        "EHKPPJrN737Ea7wqHviwGUbzDyUq2oUUX3B2hUpgftbE"
      ]
    },
    tron: {
      owners: [
        "TMYKWwRwUoLknttqkKbd9PNnspuMwXFBmb",
        "TY2c9FtxUCmigBjxkoG6iGhbMFhXfLSPU8"
      ]
    },
    bsc: {
      owners: [
        "0x05CdB1526F6e224e02919a4C018D9784Ea25eb3d",
        "0x7348332ee364590f2292577AD42d4Fe419d085D3"
      ]
    },
    ripple: {
      owners: [
        "r3EjD8wKrtWbsjZxaSfAoifEDWosh49Twe",
        "rDseVXFK1SkWhFH65cqAxf3HmvHCF6b94t",
        "rfrnxmLBiXHj38a2ZUDNzbks3y6yd3wJnV"
      ]
    }
  },
  'webot': {
    bitcoin: "webot",
    ethereum: {
      owners: [
        "0x40127a34a92ab1f32467d6e438410893589db4b2"
      ]
    },
    hyperliquid: {
      owners: [
        "0x40127a34a92ab1f32467d6e438410893589db4b2"
      ]
    },
    solana: {
      owners: [
        "9f1McBacd6pJUCM2TQ982qQ9noY3rWEU5mhcGiDydbyo"
      ]
    },
    tron: {
      owners: [
        "TFozPAaqBd2rXVw2VvRUNGkv6iaJqFYWFy"
      ]
    }
  },
  'woo-cex': {
    bitcoin: "wooCEX",
    ethereum: {
      owners: [
        "0x0d83f81bc9f1e8252f87a4109bbf0d90171c81df",
        "0x63DFE4e34A3bFC00eB0220786238a7C6cEF8Ffc4",
        "0xE505Bf08C03cc0FA4e0FDFa2487E2c11085b3FD9",
        "0xea319fd75766f5180018f8e760f51c3d3c457496"
      ]
    },
    fantom: {
      owners: [
        "0x0d83f81bc9f1e8252f87a4109bbf0d90171c81df",
        "0x63DFE4e34A3bFC00eB0220786238a7C6cEF8Ffc4",
        "0xE505Bf08C03cc0FA4e0FDFa2487E2c11085b3FD9",
        "0xea319fd75766f5180018f8e760f51c3d3c457496"
      ]
    },
    avax: {
      owners: [
        "0x0d83f81bc9f1e8252f87a4109bbf0d90171c81df",
        "0x63DFE4e34A3bFC00eB0220786238a7C6cEF8Ffc4",
        "0xE505Bf08C03cc0FA4e0FDFa2487E2c11085b3FD9",
        "0xea319fd75766f5180018f8e760f51c3d3c457496"
      ]
    },
    bsc: {
      owners: [
        "0x0d83f81bc9f1e8252f87a4109bbf0d90171c81df",
        "0x63DFE4e34A3bFC00eB0220786238a7C6cEF8Ffc4",
        "0xE505Bf08C03cc0FA4e0FDFa2487E2c11085b3FD9",
        "0xea319fd75766f5180018f8e760f51c3d3c457496"
      ]
    },
    arbitrum: {
      owners: [
        "0x0d83f81bc9f1e8252f87a4109bbf0d90171c81df",
        "0x63DFE4e34A3bFC00eB0220786238a7C6cEF8Ffc4",
        "0xE505Bf08C03cc0FA4e0FDFa2487E2c11085b3FD9",
        "0xea319fd75766f5180018f8e760f51c3d3c457496"
      ]
    },
    polygon: {
      owners: [
        "0x0d83f81bc9f1e8252f87a4109bbf0d90171c81df",
        "0x63DFE4e34A3bFC00eB0220786238a7C6cEF8Ffc4",
        "0xE505Bf08C03cc0FA4e0FDFa2487E2c11085b3FD9",
        "0xea319fd75766f5180018f8e760f51c3d3c457496"
      ]
    },
    optimism: {
      owners: [
        "0x0d83f81bc9f1e8252f87a4109bbf0d90171c81df",
        "0x63DFE4e34A3bFC00eB0220786238a7C6cEF8Ffc4",
        "0xE505Bf08C03cc0FA4e0FDFa2487E2c11085b3FD9",
        "0xea319fd75766f5180018f8e760f51c3d3c457496"
      ]
    },
    tron: {
      owners: [
        "TDZeVyGHgN5bErmWumuYRtXCrYMoUzKF7L",
        "TSC2VZai39isPj5DzByYgaBtjpBHbDcTgd"
      ]
    },
    methodology: "This wallets where provide by WOO team"
  },
  'zoomex-cex': {
    bitcoin: {
      owners: [
        "1PhvgKg6FVMf2D7jxdSyJQJS8yVqKYuF8T"
      ]
    },
    ethereum: {
      owners: [
        "0x7eb87a95948348d6ec7231b52f61281e01d53941",
        "0x8d773c8a5905284657056226a6d1b6320c2aad4a"
      ]
    },
    solana: {
      owners: [
        "CtUBgvNmNfr42VNv4LvTyU3S3uXFQ1EZZ9PDA7H91T2P"
      ]
    },
    optimism: {
      owners: [
        "0x7eb87a95948348d6ec7231b52f61281e01d53941"
      ]
    },
    arbitrum: {
      owners: [
        "0x7eb87a95948348d6ec7231b52f61281e01d53941"
      ]
    },
    bsc: {
      owners: [
        "0x7eb87a95948348d6ec7231b52f61281e01d53941"
      ]
    },
    polygon: {
      owners: [
        "0x7eb87a95948348d6ec7231b52f61281e01d53941"
      ]
    },
    mantle: {
      owners: [
        "0x7eb87a95948348d6ec7231b52f61281e01d53941"
      ]
    },
    base: {
      owners: [
        "0x7eb87a95948348d6ec7231b52f61281e01d53941"
      ]
    },
    tron: {
      owners: [
        "TA7YkTaijYM1W9SG9t2oGt6mrcDdnnLehv"
      ]
    },
    ripple: {
      owners: [
        "raq8uz1PCiSfgN94ZqUbbJWFoVtF75BEuD"
      ]
    },
    eos: {
      owners: [
        "outforzoomex"
      ]
    },
    doge: {
      owners: [
        "DDQDi8u18s4xqsUzLMrhT57rEDrrnoMiJG"
      ]
    },
    sonic: {
      owners: [
        "0x7eb87a95948348d6ec7231b52f61281e01d53941"
      ]
    },
    methodology: "We are tracking their cold and hot wallets"
  },
}

const fileConfigs = [
  'bitkub-cex',
  'blofin-cex',
  'bybit',
  'cex-io',
  'coindcx',
  'flipster',
  'gate-us',
  'indodax',
  'latoken',
  'mexc-cex',
  'nonkyc',
  'osl',
  'osl-hk',
  'phemex',
  'swissborg',
  'tothemoon',
  'weex-cex',
]

// keys that are protocol metadata rather than chain configs
const META_KEYS = ['methodology', 'hallmarks', 'misrepresentedTokens', 'doublecounted']

for (const name of fileConfigs)
  configs[name] = require(`./${name}.js`)

const allProtocols = {}
for (const [name, rawConfig] of Object.entries(configs)) {
  const config = { ...rawConfig }
  const meta = {}
  for (const k of META_KEYS) {
    if (config[k] !== undefined) { meta[k] = config[k]; delete config[k] }
  }
  allProtocols[name] = Object.assign(cexExports(config), meta)
}

// expose the configs for the duplicate-owner checker
Object.defineProperty(allProtocols, '_rawConfigs', { value: configs, enumerable: false })
module.exports = allProtocols
