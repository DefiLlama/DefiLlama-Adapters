const { sumTokensExport } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json');
const { staking } = require('../helper/staking');

const PENPAD_STAKING_CONTRACT = '0x8F53fA7928305Fd4f78c12BA9d9DE6B2420A2188';

module.exports = {
  methodology: 'Counts liquidty on the staking',
  scroll: {
    tvl: staking([PENPAD_STAKING_CONTRACT], ADDRESSES.null),
  },
};
