const { sumTokensExport } = require('../helper/unwrapLPs');

// Canonical WKLAY
const WKLAY = '0x19aac5f612f524b754ca7e7c41cbfa2e981a4432';

module.exports.klaytn = {
  methodology: 'TVL counts Canonical WKLAY coins in KaiaFun\'s Core Contract.',
  tvl: sumTokensExport({
    owners: ["0x080f8b793fe69fe9e65b5ae17b10f987c95530bf"],
    tokens: [WKLAY]
  }),
};
