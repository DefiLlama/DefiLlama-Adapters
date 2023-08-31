const ADDRESSES = require('./helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')
const {stakingPricedLP} = require("../helper/staking")

const FACTORY = '0x3a76e377ed58c8731f9df3a36155942438744ce3'
const CHAIN = 'era'

module.exports = {
  era: {
    tvl: getUniTVL({
      factory: FACTORY,
      useDefaultCoreAssets: true,
    }),
    staking: stakingPricedLP('0x9F9D043fB77A194b4216784Eb5985c471b979D67','0x31C2c031fDc9d33e974f327Ab0d9883Eae06cA4A', CHAIN, ADDRESSES.era.WETH, 'weth', false)
  },
  methodology: "TVL is total liquidity of all liquidity pools."
}

