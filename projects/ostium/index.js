const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

const owners = [
    '0x20D419a8e12C45f88fDA7c5760bb6923Cee27F98',
];

const tokens = [
    ADDRESSES.arbitrum.USDC_CIRCLE,
];

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ owners, tokens }),
  }
}
