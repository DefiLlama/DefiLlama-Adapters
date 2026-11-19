const { sumTokensExport, nullAddress } = require('../projects/helper/unwrapLPs')

// friend.tech-style adapters: a contract (or few) whose TVL is only the chain gas token.
// Each chain value is just { owner } or { owners } — the token list defaults to the gas token.
const DEFAULT_METHODOLOGY = 'Tvl is value of tokens in the contract'
const META = new Set(["start","timetravel","hallmarks","doublecounted","misrepresentedTokens"])

const configs = {
  "BakedPotatoes": {
    "dogechain": {
      "owner": "0xD0A03C69a55b8915e587e5343dfD1A17e8FD83c2"
    }
  },
  "CryptooTech": {
    "arbitrum": {
      "owner": "0x4a3720A09a90A82170779c972832eD04542deeAC"
    }
  },
  "GoldMiner": {
    "sonic": {
      "owner": "0x112ab27F55B30619AFc9Db89bEf89990627DeCd5"
    }
  },
  "PlsPrint": {
    "pulse": {
      "owner": "0x750684313510d680D172FD5734e49De3cE91925D"
    }
  },
  "base3d": {
    "base": {
      "owner": "0xa73fab6e612aaf9125bf83a683aadcdd6511d3f0"
    }
  },
  "bcraft": {
    "base": {
      "owner": "0x0De0D0cF717af57D2101F6Be0962fA890c1FBeC6"
    }
  },
  "bluebox-space": {
    "bitkub": {
      "owners": [
        "0x84a800F9e44E0b48b4055e45EbE42710e37e216F",
        "0x53bcC6BF7b1345828777027027f94EB9a7075f99"
      ]
    }
  },
  "bnbminer": {
    "bsc": {
      "owner": "0xce93F9827813761665CE348e33768Cb1875a9704"
    }
  },
  "chat3": {
    "mantle": {
      "owner": "0xAd3dbD09835CF15c543Bc59d31865D659b71060e"
    }
  },
  "cipher": {
    "arbitrum": {
      "owner": "0x2544a6412bc5aec279ea0f8d017fb4a9b6673dca"
    }
  },
  "clink": {
    "base": {
      "owner": "0x38008f8a9dec4c688864ca4bae87c0bd080c0440"
    }
  },
  "definitely": {
    "arbitrum": {
      "owner": "0x6aB5242fCaCd0d37c39F77Ff7EabdCcac5e8D450"
    },
    "sei": {
      "owner": "0x4703B92dFCb0Ad403030BF783c8EC067297B55fA"
    }
  },
  "defo": {
    "base": {
      "owner": "0x51810698D18a7ba9e73a3D63a4Fe9200C384157A"
    }
  },
  "draw-tech": {
    "base": {
      "owner": "0xE233198863b75Acc6e1AF43DAfF3f5918e35875E"
    }
  },
  "ducky-city-sofi": {
    "base": {
      "owner": "0xe276437b808741f5c73b867fde8f3fed8c326876"
    }
  },
  "fan-tech": {
    "mantle": {
      "owners": [
        "0x53167401aeebFf5677C31E1DDA945628422D7Ed2",
        "0xD42A821E584513e18cFB77e56Bf635C551dE5D63"
      ]
    }
  },
  "flareWatermelon": {
    "flare": {
      "owner": "0x4d86Aa688ba56e1971Baf8C2CBCb44D980587894"
    }
  },
  "frensly": {
    "base": {
      "owner": "0x66fA4044757Fb7812EF5b8149649d45d607624E0"
    }
  },
  "friendroom": {
    "ethereum": {
      "owner": "0x9BD0474CC4F118efe56f9f781AA8f0F03D4e7A9c"
    }
  },
  "gvex": {
    "gan": {
      "owners": [
        "0xf172eCF8230fc4F2a5C6531690F91306d0079f53"
      ]
    }
  },
  "hot-takes": {
    "avax": {
      "owner": "0xfedA2BAE8F800E990fF3f0848eBd7Eb24b4f6408"
    }
  },
  "jamfrens": {
    "polygon": {
      "owners": [
        "0x3dbea36ced3cd155605b725faf7e3f66dc5d6b2b",
        "0xda78c03A7e4C44e570FDB7c6046D3e6387d5fDDC",
        "0xF06B6dF2e5aabE6E53Cf496E7063bECbbFb50ABf"
      ]
    }
  },
  "moneyonchain": {
    "rsk": {
      "owner": "0xf773b590af754d597770937fa8ea7abdf2668370"
    }
  },
  "polyfriendtech": {
    "polygon": {
      "owner": "0x25d1bf639a350c58b03bca310ecca955fb13fad0"
    }
  },
  "posttech": {
    "arbitrum": {
      "owner": "0x87da6930626fe0c7db8bc15587ec0e410937e5dc"
    }
  },
  "sanko-gamecorp": {
    "arbitrum": {
      "owner": "0x06f1afa00990A69cA03F82D4c1A3a64A45F45fCb"
    }
  },
  "sharesgram": {
    "base": {
      "owner": "0xbe74a95d159e8e323b8c1a70f825efc85fed27c4"
    }
  },
  "sherpa-cash": {
    "avax": {
      "owners": [
        "0x6ceB170e3ec0fAfaE3Be5A02FEFb81F524FE85C5",
        "0x7CE57f6a5a135eb1a8e9640Af1eff9665ade00D9",
        "0xe1376DeF383D1656f5a40B6ba31F8C035BFc26Aa"
      ]
    }
  },
  "starshares": {
    "avax": {
      "owners": [
        "0xC605C2cf66ee98eA925B1bb4FeA584b71C00cC4C",
        "0x563395A2a04a7aE0421d34d62ae67623cAF67D03",
        "0xa481b139a1a654ca19d2074f174f17d7534e8cec",
        "0x69B7F08B2952e2EE3CA4222190BCF07831f1096f"
      ]
    }
  },
  "tagdottech": {
    "base": {
      "owner": "0x597774837debe9f074453c04cea46b532759b28a"
    }
  },
  "tomo": {
    "linea": {
      "owner": "0x9e813d7661d7b56cbcd3f73e958039b208925ef8"
    }
  },
  "turnup": {
    "bsc": {
      "owner": "0x5d9388a4ea9ebfc4af8c71c0b4aa3b372fefe12b"
    }
  },
}

const allProtocols = {}
for (const [name, cfg] of Object.entries(configs)) {
  const out = { methodology: DEFAULT_METHODOLOGY }
  for (const [k, v] of Object.entries(cfg)) {
    if (META.has(k)) { out[k] = v; continue }
    out[k] = { tvl: sumTokensExport({ ...v, tokens: [nullAddress], chain: k }) }
  }
  allProtocols[name] = out
}
module.exports = allProtocols
