const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');
const { sumTokensExport: sumTokensExportSolana } = require('../helper/solana');

const evmContracts = [
    '0x11b660397382AE3A83c4Ad80e2F791189b39e433',
    '0x90bb5bdc6acd166237640c8707a694f1fc3aab84',
];

const tokenAccounts = [
    '5bGEXW6JkR3nHfFWdTYtr7AuVvgKEUF4MWcGW7wNza6M',
    '3GzZn1Qyzc6xzCgDn83teJysBW2bMCsK6DcRNhksMNo4'
];

module.exports = {
    start: '2025-03-14',
    bsc: { tvl: sumTokensExport({ owners: evmContracts, tokens: [ADDRESSES.bsc.DUSD] }) },
    solana: { tvl: sumTokensExportSolana({ tokenAccounts }) }
};
