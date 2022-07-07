const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  ethereum: {
    chainId: '1',
  },
  cronos: {
    chainId: '25',
  },
  bsc: {
    chainId: '56',
  },
  thundercore: {
    chainId: '108',
  },
  polygon: {
    chainId: '137',
  },
  fantom: {
    chainId: '250',
  },
  kcc: {
    chainId: '321',
  },
  arbitrum: {
    chainId: '42161',
  },
  avax: {
    chainId: '43114',
  },
  optimism: {
    chainId: '10',
  },
  astar: {
    chainId: '592',
  },
  moonriver: {
    chainId: '1285',
  },
}

const yPoolDepositContract = {
  "1": {
    "USDT": {
      "contractAddress": "0x8e921191a9dc6832C1c360C7c7B019eFB7c29B2d",
      "tokenAddress": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    },
    "USDC": {
      "contractAddress": "0xdD8B0995Cc92c7377c7bce2A097EC70f45A192D5",
      "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    }
  },
  "25": {
    "USDT": {
      "contractAddress": "0x74A0EEA77e342323aA463098e959612d3Fe6E686",
      "tokenAddress": "0x66e428c3f67a68878562e79A0234c1F83c208770"
    },
    "USDC": {
      "contractAddress": "0x44a54941E572C526a599B0ebe27A14A5BF159333",
      "tokenAddress": "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59"
    }
  },
  "56": {
    "USDC": {
      "contractAddress": "0x27C12BCb4538b12fdf29AcB968B71dF7867b3F64",
      "tokenAddress": "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"
    },
    "USDT": {
      "contractAddress": "0xD195070107d853e55Dad9A2e6e7E970c400E67b8",
      "tokenAddress": "0x55d398326f99059fF775485246999027B3197955"
    }
  },
  "108": {
    "USDT": {
      "contractAddress": "0x74A0EEA77e342323aA463098e959612d3Fe6E686",
      "tokenAddress": "0x4f3C8E20942461e2c3Bdd8311AC57B0c222f2b82"
    },
    "USDC": {
      "contractAddress": "0x2641911948e0780e615A9465188D975Fa4A72f2c",
      "tokenAddress": "0x22e89898A04eaf43379BeB70bf4E38b1faf8A31e"
    }
  },
  "137": {
    "USDC": {
      "contractAddress": "0xf4137e5D07b476e5A30f907C3e31F9FAAB00716b",
      "tokenAddress": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
    },
    "USDT": {
      "contractAddress": "0x3243278E0F93cD6F88FC918E0714baF7169AFaB8",
      "tokenAddress": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"
    }
  },
  "250": {
    "USDT": {
      "contractAddress": "0xC255563d3Bc3Ed7dBbb8EaE076690497bfBf7Ef8",
      "tokenAddress": "0x049d68029688eAbF473097a2fC38ef61633A3C7A"
    },
    "USDC": {
      "contractAddress": "0x3A459695D49cD6B9637bC85B7ebbb04c5c3038c0",
      "tokenAddress": "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75"
    }
  },
  "321": {
    "USDT": {
      "contractAddress": "0xF526EFc174b512e66243Cb52524C1BE720144e8d",
      "tokenAddress": "0x0039f574eE5cC39bdD162E9A88e3EB1f111bAF48"
    },
    "USDC": {
      "contractAddress": "0xa274931559Fb054bF60e0C44355D3558bB8bC2E6",
      "tokenAddress": "0x980a5AfEf3D17aD98635F6C5aebCBAedEd3c3430"
    }
  },
  "42161": {
    "USDT": {
      "contractAddress": "0x7a483730AD5a845ED2962c49DE38Be1661D47341",
      "tokenAddress": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
    },
    "USDC": {
      "contractAddress": "0x680ab543ACd0e52035E9d409014dd57861FA1eDf",
      "tokenAddress": "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"
    }
  },
  "43114": {
    "USDT": {
      "contractAddress": "0x3D2d1ce29B8bC997733D318170B68E63150C6586",
      "tokenAddress": "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"
    },
    "USDC": {
      "contractAddress": "0x21ae3E63E06D80c69b09d967d88eD9a98c07b4e4",
      "tokenAddress": "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"
    }
  },
  "10": {
    "USDT": {
      "contractAddress": "0xF526EFc174b512e66243Cb52524C1BE720144e8d",
      "tokenAddress": "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58"
    },
    "USDC": {
      "contractAddress": "0x1e4992E1Be86c9d8ed7dcBFcF3665FE568dE98Ab",
      "tokenAddress": "0x7F5c764cBc14f9669B88837ca1490cCa17c31607"
    }
  },
  "592": {
    "USDT": {
      "contractAddress": "0xF526EFc174b512e66243Cb52524C1BE720144e8d",
      "tokenAddress": "0x3795C36e7D12A8c252A20C5a7B455f7c57b60283"
    },
    "USDC": {
      "contractAddress": "0xD236639F5B00BC6711aC799bac5AceaF788b2Aa3",
      "tokenAddress": "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98"
    }
  },
  "1285": {
    "USDT": {
      "contractAddress": "0xF526EFc174b512e66243Cb52524C1BE720144e8d",
      "tokenAddress": "0xB44a9B6905aF7c801311e8F4E76932ee959c663C"
    },
    "USDC": {
      "contractAddress": "0x680ab543ACd0e52035E9d409014dd57861FA1eDf",
      "tokenAddress": "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D"
    }
  }
}

module.exports={}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, {[chain]: block}) => {
      const { chainId } = config[chain]
      const toa = []
      Object.values(yPoolDepositContract[chainId]).forEach(i => toa.push([i.tokenAddress, i.contractAddress]))
      return sumTokens2({ chain, block, tokensAndOwners: toa, })
    }
  }
})