const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

const owners = [
    // DomFi USDC LP (Vault)
    '0xA194082Aabb75Dd1Ca9Dc1BA573A5528BeB8c2Fb',
    // DomfiTradingStorage (Collateral)
    '0xcCd5891083A8acD2074690F65d3024E7D13d66E7',
];

const tokens = [
    ADDRESSES.base.USDC,
];

module.exports = {
  base: {
    tvl: sumTokensExport({ owners, tokens }),
  }
}
