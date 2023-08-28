const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  bsc: {
    tvl: () => ({}),
    staking: staking('0xf559BF9c0563Ed5322E7F493C02ea2275d68A367', '0x77fc65deda64f0cca9e3aea7b9d8521f4151882e', 'bsc'),
  },
  bitindi: {
    tvl: () => ({}),
    staking: staking('0x140c312c8841B0a7152946C0Bc2BD343bA51bbcc', ADDRESSES.bitindi.WBNI, 'bitindi'),
  },
};
