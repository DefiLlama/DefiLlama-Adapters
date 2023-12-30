const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const ARBI_CONTRACT = '0x4810E5A7741ea5fdbb658eDA632ddfAc3b19e3c6';
const ASSETS_CONTRACTS = [
    ADDRESSES.arbitrum.GMX,
    '0x0c880f6761f1af8d9aa9c466984b80dab9a8c9e8',
    '0x3082cc23568ea640225c2467653db90e9250aaa0',
    '0x0341c0c0ec423328621788d4854119b97f44e391',
    '0x95146881b86b3ee99e63705ec87afe29fcc044d9',
    '0x51fc0f6660482ea73330e414efd7808811a57fa2',
];


module.exports = {
    methodology: 'counts the quantities of all tokens in multipool contracts.',
    start: 1000235,
    arbitrum: {
        tvl: sumTokensExport({ owner: ARBI_CONTRACT, tokens: ASSETS_CONTRACTS }),
    }
}; 
