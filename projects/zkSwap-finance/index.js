const { getUniTVL, } = require('../helper/unknownTokens')
const { sumTokensExport } = require('../helper/unwrapLPs')

const FACTORY = '0x3a76e377ed58c8731f9df3a36155942438744ce3'
const DAO_CONTRACT_V1 = '0x4Ca2aC3513739ceBF053B66a1d59C88d925f1987'
const DAO_CONTRACT_V2 = '0x056f1960b5CF53676AD9C0A7113363A812DC0c8e'

module.exports = {
  era: {
    tvl: getUniTVL({ factory: FACTORY, useDefaultCoreAssets: false, }),
    staking: sumTokensExport({ owners: ['0x9F9D043fB77A194b4216784Eb5985c471b979D67', DAO_CONTRACT_V1, DAO_CONTRACT_V2], tokens: ['0x31C2c031fDc9d33e974f327Ab0d9883Eae06cA4A'], }),
  },
  methodology: "TVL is total liquidity of all liquidity pools."
}
