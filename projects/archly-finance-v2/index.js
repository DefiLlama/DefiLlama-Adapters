const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')

const ARCHLY_V2_FACTORY = "0x12508dd9108Abab2c5fD8fC6E4984E46a3CF7824"
const ARCHLY_V2_VE_TOKEN = "0x6ACa098fa93DAD7A872F6dcb989F8b4A3aFC3342"
const ARCHLY_V2_ARC_TOKEN = "0xe8876189A80B2079D8C0a7867e46c50361D972c1"

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
