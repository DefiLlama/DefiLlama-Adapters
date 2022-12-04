const { sumTokensExport } = require('../helper/unwrapLPs')

const contracts = [
    '0x25173BB47CB712cFCDFc13ECBebDAd753090801E'
];

const tokens = [
    '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
];

module.exports = {
    bsc: { tvl: sumTokensExport({ tokens, chain: 'bsc', owners: contracts, }) }
};
