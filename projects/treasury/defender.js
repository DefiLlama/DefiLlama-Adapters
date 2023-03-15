const { sumTokensExport } = require("../helper/unwrapLPs");

const treasuryContractsBSC = [
    "0x3068405d5A640028463856D0dbDAE13B41AccE1f",
];

module.exports = {
    bsc: {
      tvl: sumTokensExport({ owners: treasuryContractsBSC, tokens: ['0x2170ed0880ac9a755fd29b2688956bd959f933f8']}),
    },
};
