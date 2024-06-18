const ADDRESSES = require('../helper/coreAssets.json')
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
  klaytn: {
    chainId: '8217',
  },
  wemix: {
    chainId: '1111',
  },
  era: {
    chainId: '324',
  },
  polygon_zkevm: {
    chainId: '1101',
  },
  linea: {
    chainId: '59144',
  },
  base: {
    chainId: '8453',
  },
  mantle: {
    chainId: '5000',
  },
  scroll: {
    chainId: '534352',
  },
  blast: {
    chainId: '81457',
  },
  xlayer: {
    chainId: '196'
  },
  taiko: {
    chainId: '167000'
  }
}

const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const yPoolDepositContract = {
  "1": {
    "ETH": {
      "contractAddress": "0x57eA46759fed1B47C200a9859e576239A941df76",
      "tokenAddress": ethAddress
    },
    "USDT": {
      "contractAddress": "0x8e921191a9dc6832C1c360C7c7B019eFB7c29B2d",
      "tokenAddress": ADDRESSES.ethereum.USDT
    },
    "USDC": {
      "contractAddress": "0xdD8B0995Cc92c7377c7bce2A097EC70f45A192D5",
      "tokenAddress": ADDRESSES.ethereum.USDC
    },
    "XY": {
      "contractAddress": "0x7fE09D2310A647c7C5043daE2053ff86956cE952",
      "tokenAddress": "0x77777777772cf0455fB38eE0e75f38034dFa50DE"
    },
    "NUM": {
      "contractAddress": "0x64d17beaE666cC435B9d40a21f058b379b2a0194",
      "tokenAddress": "0x3496B523e5C00a4b4150D6721320CdDb234c3079"
    },
    "eYe": {
      "contractAddress": "0xF0052C0B4F08078846aF48FE8C7bb365c9937c21",
      "tokenAddress": "0x9A257C90Fa239fBA07771ef7da2d554D148c2E89"
    },
    "LOOT": {
      "contractAddress": "0xD95841e7eC6b61f708829B57a3433C3Fd24B2A8c",
      "tokenAddress": "0x721A1B990699eE9D90b6327FaaD0A3E840aE8335"
    }
  },
  "25": {
    "ETH": {
      "contractAddress": "0x8266B0c8eF1d70cC4b04F8E8F7508256c0E1200f",
      "tokenAddress": "0xe44Fd7fCb2b1581822D0c862B68222998a0c299a"
    },
    "USDT": {
      "contractAddress": "0x74A0EEA77e342323aA463098e959612d3Fe6E686",
      "tokenAddress": ADDRESSES.cronos.USDT
    },
    "USDC": {
      "contractAddress": "0x44a54941E572C526a599B0ebe27A14A5BF159333",
      "tokenAddress": ADDRESSES.cronos.USDC
    },
    "BLU": {
      "contractAddress": "0x184cE49FdE76D4394795C76A91935862B7c30102",
      "tokenAddress": "0x1542bA4CA0fb6D1B4476a933B292002fd1959A52"
    },
    "CANDY": {
      "contractAddress": "0x85e363569531699EaEd1c1AC590d9f442A1299BA",
      "tokenAddress": "0x06C04B0AD236e7Ca3B3189b1d049FE80109C7977"
    },
    "DBF": {
      "contractAddress": "0xEC8476DCC72b4AB6Cbc3C2bD7f50A15891485fDB",
      "tokenAddress": "0xA2ae6273Dd65F9fA76C3d383eDe9c1261e025DAC"
    },
    "DBX": {
      "contractAddress": "0x812e9eE2437a3e4FE0A4A4A7f195536844301f07",
      "tokenAddress": "0x061E31e7768b39a4282822b65569F8d814dC15f6"
    },
    "DBC": {
      "contractAddress": "0xD99995b63F44fc500B702251262B7d9f35adA0BC",
      "tokenAddress": "0x730B05d100EeFb92f04016C6c0cF6f2bBB2C3A57"
    },
    "SINGLE": {
      "contractAddress": "0x9A4cC214782Fea5880394eFDE60187797a2FEF01",
      "tokenAddress": "0x0804702a4E749d39A35FDe73d1DF0B1f1D6b8347"
    },
    "AutoS": {
      "contractAddress": "0x58F29F7d759aef5B8e34C8e4152d6117893017aB",
      "tokenAddress": "0xae620DC4B9b6e44FBeb4a949F63AC957Cc43b5dD"
    },
    "LLT": {
      "contractAddress": "0x141E379505C3b89C5BBE4Bd2353f12CA4681e3D2",
      "tokenAddress": "0x92073dE2706eB8f0265998bCf7B8F751e1349b8F"
    }
  },
  "56": {
    "ETH": {
      "contractAddress": "0xa0ffc7eDB9DAa9C0831Cdf35b658e767ace33939",
      "tokenAddress": ADDRESSES.bsc.ETH
    },
    "USDT": {
      "contractAddress": "0xD195070107d853e55Dad9A2e6e7E970c400E67b8",
      "tokenAddress": ADDRESSES.bsc.USDT
    },
    "USDC": {
      "contractAddress": "0x27C12BCb4538b12fdf29AcB968B71dF7867b3F64",
      "tokenAddress": ADDRESSES.bsc.USDC
    },
    "eYe": {
      "contractAddress": "0x5Bd40e579Cb7D37784689044E6C7c333E2E300e6",
      "tokenAddress": "0x9A257C90Fa239fBA07771ef7da2d554D148c2E89"
    },
  },
  "108": {
    "USDT": {
      "contractAddress": "0x74A0EEA77e342323aA463098e959612d3Fe6E686",
      "tokenAddress": ADDRESSES.thundercore.TT_USDT
    },
    "USDC": {
      "contractAddress": "0x2641911948e0780e615A9465188D975Fa4A72f2c",
      "tokenAddress": ADDRESSES.thundercore.TT_USDC
    }
  },
  "137": {
    "ETH": {
      "contractAddress": "0x29d91854B1eE21604119ddc02e4e3690b9100017",
      "tokenAddress": ADDRESSES.polygon.WETH_1
    },
    "USDT": {
      "contractAddress": "0x3243278E0F93cD6F88FC918E0714baF7169AFaB8",
      "tokenAddress": ADDRESSES.polygon.USDT
    },
    "USDC": {
      "contractAddress": "0xf4137e5D07b476e5A30f907C3e31F9FAAB00716b",
      "tokenAddress": ADDRESSES.polygon.USDC
    },
    "BLU": {
      "contractAddress": "0x7C1C974367Ee28D3d7aBb088f5FCd748B3759EA4",
      "tokenAddress": "0x759d34685468604c695De301ad11A9418e2f1038",
    },
    "CANDY": {
      "contractAddress": "0x5Bd40e579Cb7D37784689044E6C7c333E2E300e6",
      "tokenAddress": "0x54E53ed24C12c1d3Df7D653587E2f27d3FbaE3d2",
    },
    "AutoS": {
      "contractAddress": "0xF98bfE69d069B40668D4F6aaeA22E73d1DC21A93",
      "tokenAddress": "0x925FAdb35B73720238cc78777d02ED4dD3100816",
    },
    "LLT": {
      "contractAddress": "0x141E379505C3b89C5BBE4Bd2353f12CA4681e3D2",
      "tokenAddress": "0x0DdE4811C4DD68Dc740A1D7997F33fF46CD186a9"
    }
  },
  "250": {
    "ETH": {
      "contractAddress": "0x5146ba1f786D41ba1E876b5Fd3aA56bD516Ed273",
      "tokenAddress": "0x74b23882a30290451A17c44f4F05243b6b58C76d"
    },
    "USDT": {
      "contractAddress": "0xC255563d3Bc3Ed7dBbb8EaE076690497bfBf7Ef8",
      "tokenAddress": ADDRESSES.fantom.fUSDT
    },
    "USDC": {
      "contractAddress": "0x3A459695D49cD6B9637bC85B7ebbb04c5c3038c0",
      "tokenAddress": ADDRESSES.fantom.USDC
    },
    "SINGLE": {
      "contractAddress": "0xe1C01c84EAc760389b2A080cfd6f3e874725c62a",
      "tokenAddress": "0xbDA9DF2cff1d36Ffc05E8e76Ec821B25dB8F3348"
    },
  },
  "321": {
    "USDT": {
      "contractAddress": "0xF526EFc174b512e66243Cb52524C1BE720144e8d",
      "tokenAddress": ADDRESSES.kcc.USDT
    },
    "USDC": {
      "contractAddress": "0xa274931559Fb054bF60e0C44355D3558bB8bC2E6",
      "tokenAddress": ADDRESSES.kcc.USDC
    }
  },
  "42161": {
    "ETH": {
      "contractAddress": "0xd1ae4594E47C153ae98F09E0C9267FB74447FEa3",
      "tokenAddress": ethAddress
    },
    "USDT": {
      "contractAddress": "0x7a483730AD5a845ED2962c49DE38Be1661D47341",
      "tokenAddress": ADDRESSES.arbitrum.USDT
    },
    "USDC": {
      "contractAddress": "0x680ab543ACd0e52035E9d409014dd57861FA1eDf",
      "tokenAddress": ADDRESSES.arbitrum.USDC
    },
    "DBF": {
      "contractAddress": "0xa1fB1F1E5382844Ee2D1BD69Ef07D5A6Abcbd388",
      "tokenAddress": "0x38A896c29Eb54c566A3fD593f559174520Dc6F75"
    },
    "DBX": {
      "contractAddress": "0x156C04ca75f11817DdbF887692990F3E46e8982B",
      "tokenAddress": "0x0b257fe969d8782fAcb4ec790682C1d4d3dF1551"
    },
    "DBC": {
      "contractAddress": "0x98b5067949e0821a52Ec2aC9A3BaaCc9b315ec21",
      "tokenAddress": "0x745f63CA36E0cfDFAc4bf0AFe07120dC7e1E0042"
    },
  },
  "43114": {
    "ETH": {
      "contractAddress": "0xEFaaf68a9a8b7D93bb15D29c8B77FCe87Fcc91b8",
      "tokenAddress": ADDRESSES.avax.WETH_e
    },
    "USDT": {
      "contractAddress": "0x3D2d1ce29B8bC997733D318170B68E63150C6586",
      "tokenAddress": ADDRESSES.avax.USDt
    },
    "USDC": {
      "contractAddress": "0x21ae3E63E06D80c69b09d967d88eD9a98c07b4e4",
      "tokenAddress": ADDRESSES.avax.USDC
    }
  },
  "10": {
    "ETH": {
      "contractAddress": "0x91474Fe836BBBe63EF72De2846244928860Bce1B",
      "tokenAddress": ethAddress
    },
    "USDT": {
      "contractAddress": "0xF526EFc174b512e66243Cb52524C1BE720144e8d",
      "tokenAddress": ADDRESSES.optimism.USDT
    },
    "USDC": {
      "contractAddress": "0x1e4992E1Be86c9d8ed7dcBFcF3665FE568dE98Ab",
      "tokenAddress": ADDRESSES.optimism.USDC
    }
  },
  "592": {
    "USDT": {
      "contractAddress": "0xF526EFc174b512e66243Cb52524C1BE720144e8d",
      "tokenAddress": ADDRESSES.astar.USDT
    },
    "USDC": {
      "contractAddress": "0xD236639F5B00BC6711aC799bac5AceaF788b2Aa3",
      "tokenAddress": ADDRESSES.moonbeam.USDC
    }
  },
  "1285": {
    "USDT": {
      "contractAddress": "0xF526EFc174b512e66243Cb52524C1BE720144e8d",
      "tokenAddress": ADDRESSES.moonriver.USDT
    },
    "USDC": {
      "contractAddress": "0x680ab543ACd0e52035E9d409014dd57861FA1eDf",
      "tokenAddress": ADDRESSES.moonriver.USDC
    }
  },
  "8217": {
    "USDT": {
      "contractAddress": "0xF526EFc174b512e66243Cb52524C1BE720144e8d",
      "tokenAddress": ADDRESSES.klaytn.oUSDT
    },
    "USDC": {
      "contractAddress": "0xB238d4339a44f93aBCF4071A9bB0f55D2403Fd84",
      "tokenAddress": ADDRESSES.klaytn.oUSDC
    }
  },
  "1111": {
    "USDT": {
      "contractAddress": "0xA5Cb30E5d30A9843B6481fFd8D8D35DDED3a3251",
      "tokenAddress": "0xA649325Aa7C5093d12D6F98EB4378deAe68CE23F"
    },
    "USDC": {
      "contractAddress": "0x3243278E0F93cD6F88FC918E0714baF7169AFaB8",
      "tokenAddress": ADDRESSES.moonriver.USDC
    }
  },
  "324": {
    "ETH": {
      "contractAddress": "0x935283A00FBF8E40fd2f8C432A488F6ADDC8dB67",
      "tokenAddress": ethAddress
    },
    "USDC": {
      "contractAddress": "0x75167284361c8D61Be7E4402f4953e2b112233cb",
      "tokenAddress": ADDRESSES.era.USDC
    }
  },
  "1101": {
    "ETH": {
      "contractAddress": "0x9fE77412aA5c6Ba67fF3095bBc534884F9a61a38",
      "tokenAddress": ethAddress
    },
    "USDC": {
      "contractAddress": "0x1acCfC3a45313f8F862BE7fbe9aB25f20A93d598",
      "tokenAddress": ADDRESSES.polygon_zkevm.USDC
    }
  },
  "59144": {
    "ETH": {
      "contractAddress": "0xA5Cb30E5d30A9843B6481fFd8D8D35DDED3a3251",
      "tokenAddress": ethAddress
    },
    "USDC": {
      "contractAddress": "0x9d90CFa17f3AFceE2505B3e9D75113e6f5c9E843",
      "tokenAddress": ADDRESSES.linea.USDC
    }
  },
  "8453": {
    "ETH": {
      "contractAddress": "0xD195070107d853e55Dad9A2e6e7E970c400E67b8",
      "tokenAddress": ethAddress
    },
    "USDC": {
      "contractAddress": "0xA5Cb30E5d30A9843B6481fFd8D8D35DDED3a3251",
      "tokenAddress": ADDRESSES.base.USDbC
    },
    "LOOT": {
      "contractAddress": "0x141E379505C3b89C5BBE4Bd2353f12CA4681e3D2",
      "tokenAddress": "0x94a42083948d86432246eAD625B30d49014A4BFF"
    }
  },
  "5000": {
    "ETH": {
      "contractAddress": "0xdD8B0995Cc92c7377c7bce2A097EC70f45A192D5",
      "tokenAddress": ADDRESSES.mantle.WETH
    },
    "USDC": {
      "contractAddress": "0xA5Cb30E5d30A9843B6481fFd8D8D35DDED3a3251",
      "tokenAddress": ADDRESSES.mantle.USDC
    },
    "USDT": {
      "contractAddress": "0x0241fb446d6793866245b936F2C3418F818bDcD3",
      "tokenAddress": ADDRESSES.mantle.USDT
    },
    "LOOT": {
      "contractAddress": "0x141E379505C3b89C5BBE4Bd2353f12CA4681e3D2",
      "tokenAddress": "0x94a42083948d86432246eAD625B30d49014A4BFF"
    }
  },
  "534352": {
    "ETH": {
      "contractAddress": "0x0241fb446d6793866245b936F2C3418F818bDcD3",
      "tokenAddress": ethAddress
    },
    "USDC": {
      "contractAddress": "0xF526EFc174b512e66243Cb52524C1BE720144e8d",
      "tokenAddress": ADDRESSES.scroll.USDC
    }
  },
  "81457": {
    "ETH": {
      "contractAddress": "0xFa77c2DecCB21ACb9Bf196408Bf6aD5973D07762",
      "tokenAddress": ethAddress
    },
    "LOOT": {
      "contractAddress": "0xD95841e7eC6b61f708829B57a3433C3Fd24B2A8c",
      "tokenAddress": "0x1C559a960aE5293eA56C40EFC3c0169B413DDcF3"
    }
  },
  "196": {
    "ETH": {
      "contractAddress": "0xFa77c2DecCB21ACb9Bf196408Bf6aD5973D07762",
      "tokenAddress": ADDRESSES.xlayer.WETH
    },
    "USDT": {
      "contractAddress": "0x1e4992E1Be86c9d8ed7dcBFcF3665FE568dE98Ab",
      "tokenAddress": ADDRESSES.xlayer.USDT
    }
  },
  "167000": {
    "ETH": {
      "contractAddress": "0xFa77c2DecCB21ACb9Bf196408Bf6aD5973D07762",
      "tokenAddress": ethAddress
    },
    "USDC": {
      "contractAddress": "0x1e4992E1Be86c9d8ed7dcBFcF3665FE568dE98Ab",
      "tokenAddress": ADDRESSES.taiko.USDC
    }
  }
}

module.exports={}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const { chainId } = config[chain]
      const toa = []
      Object.values(yPoolDepositContract[chainId]).forEach(i => toa.push([i.tokenAddress, i.contractAddress]))
      return sumTokens2({ api, tokensAndOwners: toa, })
    }
  }
})