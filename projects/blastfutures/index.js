const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

module.exports = {
  blast: {
    // tvl: sumTokensExport({ owner: '0x3Ba925fdeAe6B46d0BB4d424D829982Cb2F7309e', tokens: [ADDRESSES.blast.USDB, ADDRESSES.blast.WETH]}),
    // staking: staking('0x67dBA61709D78806395acDBa3EF9Df686aF5dc24', '0x236bb48fcF61ce996B2C8C196a9258c176100c7d'),
    tvl: () => ({}) // moved to rabbitx
  },
}
