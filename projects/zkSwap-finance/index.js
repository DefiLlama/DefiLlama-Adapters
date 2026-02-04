const { getUniTVL, } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

const config = {
  era: {
    factoryV2: '0x3a76e377ed58c8731f9df3a36155942438744ce3',
    masterchef: '0x9F9D043fB77A194b4216784Eb5985c471b979D67',
    daoV1: '0x4Ca2aC3513739ceBF053B66a1d59C88d925f1987',
    daoV2: '0x056f1960b5CF53676AD9C0A7113363A812DC0c8e',
    zfToken: '0x31C2c031fDc9d33e974f327Ab0d9883Eae06cA4A'
  },
  sonic: {
    factoryV2: '0xCe98a0E578b639AA90EE96eD5ba8E5a4022de529'
  },
  monad: {
    factoryV2: '0x0ff16867BcaC3C5fdc2dc73558e3F8e2ed89EEA2'
  },
}

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({ factory: config.era.factoryV2, useDefaultCoreAssets: true, }),
    staking: staking([config.era.masterchef, config.era.daoV1, config.era.daoV2], [config.era.zfToken]),
  },
  sonic: {
    tvl: getUniTVL({ factory: config.sonic.factoryV2, useDefaultCoreAssets: true}),
  },
  monad: {
    tvl: getUniTVL({ factory: config.monad.factoryV2, useDefaultCoreAssets: true}),
  },
  methodology: "TVL is total liquidity of all liquidity pools."
}
