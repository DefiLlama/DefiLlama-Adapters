const { masterchefExports, sumUnknownTokens } = require("../helper/unknownTokens")
const sdk = require('@defillama/sdk');

const poolAddressesABI = 'function poolAddresses(uint256) view returns (address)'

const config = {
  bsc: {
    masterchef: '0xb7908c88ce10592583541f1f0ef68d7d5d09f988',
    nativeTokens: [
      '0x6b6ffcee13142c5a7b0e7e2665d89321b38b0386',  // SoW
      '0x46d502fac9aea7c5bc7b13c8ec9d02378c33d36f',  // WSPP
      '0xf83849122f769a0a7386df183e633607c890f6c0',  // ABS
      '0xcccbf2248ef3bd8d475ea5de8cb06e19f4591a8e',  // GWSPP
    ],
    staking: [
      ['0x46d502fac9aea7c5bc7b13c8ec9d02378c33d36f', '0x87B4a0B47704c281F6ef2705dC5D57D47FfdD9Bf',], // WSPP staking
      ['0xf83849122f769a0a7386df183e633607c890f6c0', '0x41351c6e23d55ffbf8992059a2033797a333dbc1',], // ABS staking
      ['0xc18083cc09da5fb3e29ae39e186a817efce6cb3f', '0xB3F8A31521833a9BC4e75129A3d203Fc9B4802c8',], // VIVA staking
      ['0x921d3a6ed8223AFb6358410F717e2FB13cbae700', '0xcee0c2f132083175bf5f06c5490c911a21a70461',], // QRT staking
      ['0x4227C55bF21E95a87C00988FeC98c50E9AbA866C', '0x44d3a24fcd9e1f5a35c383889db1c874fab35a54',], // FluffyCorgi staking
      ['0x06d7645f4f483bb925db2094dD5fdb1f75B07D61', '0x85c3c3452b409db107d2f38cf60b2802ef59aaf4',], // SCARY staking
    ]
  },
  polygon: {
    poolInfoABI: poolAddressesABI,
    getToken: i => i,
    masterchef: '0x005d788D0EaCFA5BC033754E4ABCf442352782bC',
    nativeTokens: [
      '0x46D502Fac9aEA7c5bC7B13C8Ec9D02378C33D36F',  // WSPP
    ],
    staking: [
      ['0x46D502Fac9aEA7c5bC7B13C8Ec9D02378C33D36F', '0x1476322919a861e4E2215d87a721B93bD9c9919D',], // WSPP staking
    ]
  },
  avax: {
    staking: [
      ['0xe668f8030bf17f3931a3069f31f4fa56efe9dd54', '0x7f20f17660a5b9565dc7c98efc360e3c7092c72e',], // WSPP staking
    ]
  },
  kardia: {
    poolInfoABI: poolAddressesABI,
    getToken: i => i,
    masterchef: '0x2f78685a7930C7A8288fE489a67d8E35a2029D89',
    nativeTokens: [
      '0xccB32737C6dFfddFFB24CA8A96b588ac7b1822e7',  // WSPP
    ],
    staking: [
      ['0xccB32737C6dFfddFFB24CA8A96b588ac7b1822e7', '0x18Ee117A92509047EBC34EFcc0CcDC8692cDc37c',], // WSPP staking
    ]
  },
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { masterchef, nativeTokens, staking, poolInfoABI, getToken, } = config[chain]
  if (masterchef)
    module.exports[chain] = masterchefExports({ masterchef, nativeTokens, useDefaultCoreAssets: true, chain, poolInfoABI, getToken, })[chain]
  if (staking) {
    const stakingFn = (api) => sumUnknownTokens({ api, tokensAndOwners: staking, useDefaultCoreAssets: true, })
    if (module.exports[chain])
      module.exports[chain].staking = sdk.util.sumChainTvls([module.exports[chain].staking, stakingFn])
    else
      module.exports[chain] = { staking: stakingFn }
  }
})
