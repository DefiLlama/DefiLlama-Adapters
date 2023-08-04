const ADDRESSES = require('../helper/coreAssets.json')
const index = require('../stargate-finance/index')
const { treasuryExports } = require('../helper/treasury')

module.exports = treasuryExports({
  bsc: {
    owner: '0xA2B48Ad28c09cc64CcCf9eD73e1EfceD052877d5',
    tokens: [ADDRESSES.bsc.USDT, ADDRESSES.bsc.BUSD, '0xd397a40884ce00e662b419673e0b15cae628877f', '0x41516dca7efe69518ec414de35e5aa067788de3d',],
    resolveLP: true,
  }
})