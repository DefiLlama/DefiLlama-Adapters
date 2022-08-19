const {staking} = require('../helper/staking')
const {usdCompoundExports} = require('../helper/compound')
const { getUniTVL } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk');

const abis = {
  oracle: {"constant":true,"inputs":[],"name":"getRegistry","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},
  underlyingPrice: {"constant":true,"inputs":[{"internalType":"address","name":"cToken","type":"address"}],"name":"getPriceForUnderling","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
}

const unitroller_fantom = "0x892701d128d63c9856A9Eb5d967982F78FD3F2AE"
const factory = '0xEF45d134b73241eDa7703fa787148D9C9F4950b0'
const factory2 = '0x9d3591719038752db0c8bEEe2040FfcC3B2c6B9c'
const chain = 'fantom'
const ammTvl = getUniTVL({ chain, factory, useDefaultCoreAssets: true, })
const ammTvl2 = getUniTVL({ chain, factory: factory2, useDefaultCoreAssets: true, })
const olalending = usdCompoundExports(unitroller_fantom, "fantom", "0xed8F2C964b47D4d607a429D4eeA972B186E6f111", abis)

module.exports = {
  timetravel: true,
  doublecounted: false,
  fantom:{
    tvl: sdk.util.sumChainTvls([ammTvl,ammTvl2, olalending.tvl]),
    staking: staking("0x2fbff41a9efaeae77538bd63f1ea489494acdc08", "0x5cc61a78f164885776aa610fb0fe1257df78e59b", 'fantom'),
    borrowed: olalending.borrowed
  },
}
