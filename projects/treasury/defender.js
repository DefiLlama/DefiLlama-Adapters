const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const treasuryContractsBSC = [
    "0x3068405d5A640028463856D0dbDAE13B41AccE1f",
];

module.exports = {
    bsc: {
      tvl: sumTokensExport({ owners: treasuryContractsBSC, tokens: [ADDRESSES.bsc.ETH]}),
    },
};
