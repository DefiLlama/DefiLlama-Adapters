const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const ARBI_CONTRACT = '0x4810E5A7741ea5fdbb658eDA632ddfAc3b19e3c6';
const ARBI_ASSETS_CONTRACTS = [
    ADDRESSES.arbitrum.GMX,
    '0x0c880f6761f1af8d9aa9c466984b80dab9a8c9e8',
    '0x3082cc23568ea640225c2467653db90e9250aaa0',
    '0x0341c0c0ec423328621788d4854119b97f44e391',
    '0x51fc0f6660482ea73330e414efd7808811a57fa2',
    '0x539bde0d7dbd336b79148aa742883198bbf60342',
];

const SPI_CONTRACT = '0xbB5b3D9F6B57077b4545ea9879ee7fD0BDB08dB0';
const SPI_ASSETS_CONTRACTS = [
    ADDRESSES.arbitrum.USDT,
    ADDRESSES.arbitrum.WBTC,
    ADDRESSES.arbitrum.WSTETH,
];


module.exports = {
    methodology: 'counts the quantities of all tokens in all multipool contracts.',
    arbitrum: {
        tvl: sumTokensExport({ ownerTokens: [[ARBI_ASSETS_CONTRACTS, ARBI_CONTRACT], [SPI_ASSETS_CONTRACTS, SPI_CONTRACT]] })
    }
}; 
