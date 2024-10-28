const { impermaxHelper } = require('./impermaxHelper.js')

const config = {
  ethereum: {
    factories: [
      '0x8C3736e2FE63cc2cD89Ee228D9dBcAb6CE5B767B'
    ]
  },
  polygon: {
    factories: [
      '0xBB92270716C8c424849F17cCc12F4F24AD4064D6',
      '0x7F7AD5b16c97Aa9C2B0447C2676ce7D5CEFEbCd3',
      '0x7ED6eF7419cD9C00693d7A4F81c2a151F49c7aC2',
      '0x60f57cF15a34fA0Aa25eF37eB827E1a0948966c5'
    ]
  },
  arbitrum: {
    factories: [
      '0x8C3736e2FE63cc2cD89Ee228D9dBcAb6CE5B767B',
      '0x9708e0b216a88d38d469b255ce78c1369ad898e6',
      '0x97bc7fefb84a4654d4d3938751b5fe401e8771c2',
    ]
  },
  avax: {
    factories: [
      '0x8C3736e2FE63cc2cD89Ee228D9dBcAb6CE5B767B',
      '0x9708e0b216a88d38d469b255ce78c1369ad898e6',
      '0xc7f24fd6329738320883ba429C6C8133e6492739',
    ]
  },
  moonriver: {
    factories: [
      '0x8C3736e2FE63cc2cD89Ee228D9dBcAb6CE5B767B',
    ]
  },
  canto: {
    factories: [
      '0x9708E0B216a88D38d469B255cE78c1369ad898e6',
    ]
  },
  era: {
    factories: [
      '0x6ce1a2C079871e4d4b91Ff29E7D2acbD42b46E36',
    ]
  },
  fantom: {
    factories: [
      '0x60aE5F446AE1575534A5F234D6EC743215624556',
      '0x9b4ae930255CB8695a9F525dA414F80C4C7a945B',
    ]
  },
  scroll: {
    factories: [
      '0x02Ff7B4d96EeBF8c9B34Fae0418E591e11da3099',
      '0xFBD17F3AA7d6506601D2bF7e15a6C96081296a01', // scroll stablefactory
    ]
  },
  base: {
    factories: [
      '0x66ca66E002a9CEE8dEfE25dB6f0c6225117C2d9f',
      '0x8aDc5F73e63b3Af3fd0648281fE451738D8B9D86',
      '0x47183bB55AD0F891887E099Cec3570d3C667cD00'
    ]
  },
  mantle: {
    factories: [
      '0x3047523D5ed0df1545B1C440BdAaB095f1f3cf5C'
    ]
  },
  optimism: {
    factories: [
      '0xa058Ba91958cD30D44c7B0Cf58A369876Fb70B05'
    ]
  },
  real: {
    factories: [
      '0x3b1f3a48a70e372144307a4b126a5cda46e169ad'
    ]
  }
}

const blacklistedPools = {
  ethereum: [
    '0xa00d47b4b304792eb07b09233467b690db847c91', // IMX-WETH
    '0x46af8ac1b82f73db6aacc1645d40c56191ab787b', // NDX-ETH
    '0x8dcba0b75c1038c4babbdc0ff3bd9a8f6979dd13', // DEFI5-ETH
    '0x08650bb9dc722c9c8c62e79c2bafa2d3fc5b3293', // AMP-ETH
    '0xdf5096804705d135656b50b62f9ee13041253d97', // YPIE-ETH
  ],
  polygon: [
    '0x76483d4ba1177f69fa1448db58d2f1dbe0fb65fa', // IMX-WETH
    '0x8ce3bf56767dd87e87487f3fae63e557b821ea32', // IMX-WETH
    '0xd4f5f9643a4368324ac920414781b1c5655baed1', // IMX-WETH
    '0x5f819f510ca9b1469e6a3ffe4ecd7f0c1126f8f5', // IMX-WETH
    '0x23312fceadb118381c33b34343a61c7812f7a6a3', // IMX-WETH
    '0x5ed3147f07708a269f744b43c489e6cf3b60aec4', // USDT-DAI
    '0xb957d5a232eebd7c4c4b0a1af9f2043430304e65', // USDC-rUSD
    '0x87B94444d0f2c1e4610A2De8504D5d7b81898221', // QUICK-POLYDOGE
  ],
  arbitrum: [
    '0xb7e5e74b52b9ada1042594cfd8abbdee506cc6c5', // IMX-WETH
    '0xcc5c1540683aff992201d8922df44898e1cc9806', // IMX-WETH
    '0x8884cc766b43ca10ea41b30192324c77efdd04cd', // NYAN-ETH
    '0x4062f4775bc001595838fbaae38908b250ee07cf', // SWPR-ETH
  ],
  avax: [
    '0xde0037afbe805c00d3cec67093a40882880779b7', // IMX-WETH
    '0xe9439f67201894c30f1c1c6b362f0e9195fb8e2c', // IMX-WETH
    '0xa34862a7de51a0e1aee6d3912c3767594390586d', // IMX-WETH
    '0x69c1c44e8742b66d892294a7eeb9aac51891b0eb', // USDC-UST
  ],
  moonriver: [
    '0x6ed3bc66dfcc5ac05daec840a75836da935fac97', // IMX-WETH
  ],
  canto: [],
  era: [],
  fantom: [
    '0x877a330af63094d88792b9ca28ac36c71673eb1c', // IMX-FTM
    '0xb97b6ed451480fe6466a558e9c54eaac32e6c696', // OXD-FTM
  ],
  scroll: [],
  base: [],
  mantle: [],
  optimism: [],
  real: []
}

module.exports = {}

impermaxHelper(module.exports, config, blacklistedPools)
