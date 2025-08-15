const { sumTokensExport } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

const ADDRESSES_CONFIG = {
  bsc: {
    LAIKA: '0x1865dc79a9e4b5751531099057d7ee801033d268',
    PAIR: '0x712903c3ca65aeeb2e5452d04da090796fcae0df',
    staking: '0x0F571BdbCAC2E41503c0cca86E6aE320e9E6093C',
  }
}

module.exports = {
  bsc: {
    tvl: () => ({}),
    staking: staking(ADDRESSES_CONFIG.bsc.staking, ADDRESSES_CONFIG.bsc.LAIKA),
    pool2: sumTokensExport({ owner: ADDRESSES_CONFIG.bsc.staking, tokens: [ADDRESSES_CONFIG.bsc.PAIR] }),
  },
}
