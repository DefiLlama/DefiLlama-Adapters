const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const contracts = [
    '0x25173BB47CB712cFCDFc13ECBebDAd753090801E'
];

const tokens = [
    ADDRESSES.bsc.USDC
];

module.exports = {
    bsc: { tvl: sumTokensExport({ tokens, chain: 'bsc', owners: contracts, }) }
};
