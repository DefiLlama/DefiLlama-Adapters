const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const ARBI_CONTRACT = '0xB1947d7596840D0a14D30cCA91be69ddC24ab75d';
const ASSETS_CONTRACTS = [
    ADDRESSES.arbitrum.GMX,
    '0x11cdb42b0eb46d95f990bedd4695a6e3fa034978',
    '0x18c11fd286c5ec11c3b683caa813b77f5163a122',
    '0xb64e280e9d1b5dbec4accedb2257a87b400db149',
    '0x4e352cf164e64adcbad318c3a1e222e9eba4ce42',
];


module.exports = {
    methodology: 'counts the quantities of all tokens in multipool contracts.',
    start: 1000235,
    arbitrum: {
        tvl: sumTokensExport({ owner: ARBI_CONTRACT, tokens: ASSETS_CONTRACTS }),
    }
}; 
