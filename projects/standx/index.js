const { sumTokensExport } = require('../helper/unwrapLPs');
const { sumTokensExport: sumTokensExportSolana } = require('../helper/solana');

const bscDUSDAddress = '0xaf44A1E76F56eE12ADBB7ba8acD3CbD474888122';

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
    methodology: "StandX TVL is calculated by aggregating the balances of bridged vault addresses on the respective chain. These vaults hold the underlying collateral for all DUSD bridged to the StandX ecosystem, representing the total value secured by the protocol.",
    bsc: { tvl: sumTokensExport({ owners: evmContracts, tokens: [bscDUSDAddress] }) },
    solana: { tvl: sumTokensExportSolana({ tokenAccounts }) }
};
