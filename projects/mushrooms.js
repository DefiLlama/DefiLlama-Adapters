const config = {
  ethereum: {
    vaults: [
      '0x0c0291f4c12f04da8b4139996c720a89d28ca069',
      '0x1e074d6da2987f0cb5a44f2ab1c5bfeddd81f23f',
      '0x6802377968857656fe8ae47fbece76aae588eef7',
      '0x23b197dc671a55f256199cf7e8bee77ea2bdc16d',
      '0x374513251ef47db34047f07998e31740496c6faa',
      '0xb0f1a38F5531b398E2081c2F9E61EdD2A924b488',
      '0x41e0c2a507415e25005b1713f5f68ad6648fcf43',
      '0xb06661A221Ab2Ec615531f9632D6Dc5D2984179A',
      '0x3edee5f69e9a8f88da9063b1aa78311e38dbe96c',
      '0x037B39EdAE767EA692884D51fc697c54e777710e',
      '0x076950237f8c0D27Ac25694c9078F96e535723BC',
      '0x5DEDEC994C11aB5F9908f33Aed2947F33B67a449',
      '0xe85e9fB53fe5E2fa74Dda1A1010555F55DbD347B',
      '0xe28b1d0d667824e74b408a02c101cf0c0652d2ea',
      '0x05c85ed5fd1a2088b42021f7ac42bad709da844a',
      '0x1B428B6C389E25133bf0f466Fc5d3E2764F3582b',
    ]
  },
  bsc: {
    vaults: [
      '0xa283aA7CfBB27EF0cfBcb2493dD9F4330E0fd304',
      '0x64bdf61de87920515c4cb1bc05c7f3f7d6c9d555',
      '0x386A8DCf07dc3Aa882Aa0A8f8Ee90473c177F6f3',
      '0xa1c6670f5b040831156641a669f0dca318272f7f',
      '0x73142be337c11f9c962b4aba80edebcfbc47e1e6',
      '0x4dDf7F8Ad6457bECcDFEA9c11006a77A4307c94B',
      '0xFE526BcD5aD38F28C685BDb045B4c1E30f19F224',
      '0x064213bc8cd6980efE41A4247f0Ed5e99257E5f9',
      '0x53e510f6242f841088e29c7d26a44c42aa2db200',
    ]
  },
  fantom: {
    vaults: [
      '0xE71FD0dC4c0349C320053B865a95aE29c09b92B5',
      '0xd21E83422335b21E2e11567c13780a3f3972c0E8',
      '0x5f8757eA9CB135E904a7483F2bae780B9DDbd507',
      '0xd324fbBDad6960e8003f8ec6B9D9D6B2D847fd12',
      '0xe74358fEc47B55F94F5aCb4f32a30a36623Fc373',
      '0x70b89c91ffcc6bd3325419ff63b23cd50d515bc2',
      '0x3371d92e633f7a49fcfa9114e55dafc485bd413b',
      '0xe09CD96100A0e9a19e064dc475568a428515d2e2',
      '0x4471332148688fAA64705a39ec630A6AD692B40a',
      '0x771fbBc372045424fE51Dc761F728870a5a7e933',
      '0x91B6d34679fdEae095B3873b39c5f17C59044339',
    ]
  },
  polygon: {
    vaults: [
      '0xa283aa7cfbb27ef0cfbcb2493dd9f4330e0fd304',
      '0x0c0291f4c12f04da8b4139996c720a89d28ca069',
      '0xe74358fEc47B55F94F5aCb4f32a30a36623Fc373',
      '0xC126A5f0688E87E4069159ad9Bd3cbe4EeEaD165',
      '0xa1c6670F5B040831156641a669F0DCa318272f7f',
      '0x2255A52Cd5549b8AA04E4ED7C8AD730628f6C747',
    ]
  },
  avax: {
    vaults: [
      '0xa33b55d868e57b20df957ddc2f044f09f676967b',
      '0x78ff341f2db10c10a7562227c7a28bc93bb0fbcf',
      '0xdd21bc823d58845f6126c9cef052a2d4340a07c8',
      '0x8F288A56A6c06ffc75994a2d46E84F8bDa1a0744',
      '0x4e504c6ca43cd1bbd9096a2c2e77a176d10910b1',
    ]
  }
}

// node test.js projects/mushrooms.js
module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = config[chain].vaults
      return api.erc4626Sum({ calls: vaults, permitFailure: true, })
    }
  }
})