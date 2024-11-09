const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')

const ARCHLY_V2_FACTORY = "0x12508dd9108Abab2c5fD8fC6E4984E46a3CF7824"
const ARCHLY_V2_VE_TOKEN = "0x6ACa098fa93DAD7A872F6dcb989F8b4A3aFC3342"
const ARCHLY_V2_ARC_TOKEN = "0xe8876189A80B2079D8C0a7867e46c50361D972c1"

const ARCHLY_V2_FACTORY_ZKSYNC = "0x30A0DD3D0D9E99BD0E67b323FB706788766dCff2"
const ARCHLY_V2_VE_TOKEN_ZKSYNC = "0x483BdBdbf60d9650845c8097E002c2241D92ab45"
const ARCHLY_V2_ARC_TOKEN_ZKSYNC = "0xfB4c64c144c2bD0E7F2A06da7d6aAc32d8cb2514"

const ARCHLY_V2_FACTORY_ETHEREUM = "0xE8E2b714C57937E0b29c6ABEAF00B52388cAb598"
const ARCHLY_V2_VE_TOKEN_ETHEREUM = "0x0361a173dC338c32E57079b2c51cEf36f8A982f1"
const ARCHLY_V2_ARC_TOKEN_ETHEREUM = "0x9482c407d32204462D8CBbC0755e96C39B79878E"

const tvl = getUniTVL({ factory: ARCHLY_V2_FACTORY, useDefaultCoreAssets: true, hasStablePools: true, })

const config = {
  telos: { lp: '0xe7F2AED9670933eDdc71634aAC0A13a187D4fE8f' },
  arbitrum: { lp: '0x1e99d0c1f55cC082badD0E42B41C0Cfa31F99aD3' },
  arbitrum_nova: { lp: '0x66a185f87A7bc337E38eA988fc8DEcf2F35a28d1' },
  base: { lp: '0x577B2E4C7Ddd23d2fA9D56b4456505e420851046' },
  blast: { lp: '0x6255290D88Cdd837bC27E83A11c39E12CD1B2111' },
  bsc: { lp: '0xf53aFC5c5D5eE21DC68350AbF8eAb6A4d8e6E186' },
  fantom: { lp: '0x263677110c07Ec272f8b1fe08a473700e6777eDd' },
  filecoin: { lp: '0x1a77798C1E3f6E93C0bc98596882580Dbc6BD6A0' },
  fraxtal: { lp: '0x51cb81CF0bA5c632a0D043131914f5570B41d30d' },
  kava: { lp: '0x90e267b0bF52F9993d32DfAB9A415e2B00A870d0' },
  optimism: { lp: '0x577B2E4C7Ddd23d2fA9D56b4456505e420851046' },
  polygon: { lp: '0xc01d8ee3A405f758a3bD9f8cA253F00B9EDec2be' },
  avax: { lp: '0x8a39ACACB5da8Fc4aEfDcaEeCA9ADf09758931da' },
  cronos: { lp: '0xCf4cEEA40DDeeB49cd407e32f804b22890A6DFD6' },
  mantle: { lp: '0x31bFb9003229BCC89EeF55895A374Fd0ed36772c' },
  metis: { lp: '0xA152A0Ee0Bc15A937D5365DEB8507D063467A68d' },
  neon_evm: { lp: '0x9a08ab9b8b9A90bF9fe836D28E85808Db29Dc1aD' },
  mode: { lp: '0xC6FA6454E76cF425a020fdb1EF61FeB0e551912C' },
  zora: { lp: '0x577B2E4C7Ddd23d2fA9D56b4456505e420851046' },
}

module.exports = {
  misrepresentedTokens: true,
};

Object.keys(config).forEach(chain => {
  const { lp } = config[chain]
  module.exports[chain] = {
    tvl,
    staking: sumTokensExport({ owner: ARCHLY_V2_VE_TOKEN, tokens: [ARCHLY_V2_ARC_TOKEN], lps: [lp], useDefaultCoreAssets: true,  })
  }
})

const zksyncTvl = getUniTVL({ factory: ARCHLY_V2_FACTORY_ZKSYNC, useDefaultCoreAssets: true, hasStablePools: true, })
module.exports['era'] = {
  tvl: zksyncTvl,
  staking: sumTokensExport({ owner: ARCHLY_V2_VE_TOKEN_ZKSYNC, tokens: [ARCHLY_V2_ARC_TOKEN_ZKSYNC], lps: ['0xc7a34F4cADE2b1C6d6f3f332Cd76Ee4951b2a621'], useDefaultCoreAssets: true,  })
}

const ethereumTvl = getUniTVL({ factory: ARCHLY_V2_FACTORY_ETHEREUM, useDefaultCoreAssets: true, hasStablePools: true, })
module.exports['ethereum'] = {
  tvl: ethereumTvl,
  staking: sumTokensExport({ owner: ARCHLY_V2_VE_TOKEN_ETHEREUM, tokens: [ARCHLY_V2_ARC_TOKEN_ETHEREUM], lps: ['0xBBa0BF97D0b0Fe0F2c50c421367E0Ce9bbb15E42'], useDefaultCoreAssets: true,  })
}