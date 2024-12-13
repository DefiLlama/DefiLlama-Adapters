const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');
const BBBPUMP_CONTRACT = '0x2E24BFdE1EEDa0F1EA3E57Ba7Ff10ac6516ab5Ec'
module.exports = {
    start: '2024-10-10',
    xdc: { tvl: sumTokensExport({ owner: BBBPUMP_CONTRACT, tokens: [nullAddress]}) },
};