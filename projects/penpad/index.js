
const ADDRESSES = require('../helper/coreAssets.json');
const { staking } = require('../helper/staking');

module.exports = {
  methodology: 'Counts liquidty on the staking',
  scroll: {
    tvl: staking('0x8F53fA7928305Fd4f78c12BA9d9DE6B2420A2188', ADDRESSES.null),
  },
}
