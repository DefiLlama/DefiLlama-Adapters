const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

const owners = [
    // OLP vault 
    '0x20D419a8e12C45f88fDA7c5760bb6923Cee27F98',
    // Trading collateral
    '0xcCd5891083A8acD2074690F65d3024E7D13d66E7',
];

const tokens = [
    ADDRESSES.arbitrum.USDC_CIRCLE,
];

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ owners, tokens }),
  }
}
