const { sumTokens2 } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json');

const ethereumOwner = '0xB74749b2213916b1dA3b869E41c7c57f1db69393';
const arbitrumOwner = '0xB74749b2213916b1dA3b869E41c7c57f1db69393';
const avaxOwner = '0xB74749b2213916b1dA3b869E41c7c57f1db69393';
const polygonZkEVMOwner = '0x0896AC8B9e2DC3545392ff65061E5a8a3eD68824';

const ethereumTokens = [
    ADDRESSES.ethereum.USDC,
    ADDRESSES.ethereum.WBTC,
    ADDRESSES.ethereum.WETH,
    '0x6A7b717aE5Ed65F85BA25403D5063D368239828e',
];

const arbitrumTokens = [
    ADDRESSES.arbitrum.WBTC,
    ADDRESSES.arbitrum.WETH,
    ADDRESSES.arbitrum.USDC_CIRCLE,
];

const avaxTokens = [
    ADDRESSES.avax.BTC_b,
    ADDRESSES.avax.USDC,
    ADDRESSES.avax.WETH_e,
    '0xF3bcB00146d1123dD19974De758F83D01E26D3F1',
];

const polygonZkEVMTokens = [
    ADDRESSES.polygon_zkevm.USDC,
    ADDRESSES.polygon_zkevm.WETH,
    '0xEA034fb02eB1808C2cc3adbC15f447B93CbE08e1',
];

module.exports = {
    ethereum: {
        tvl: async (_, _1, _2, { api }) => {
            return sumTokens2({
                owner: ethereumOwner,
                tokens: ethereumTokens,
                api,
            });
        },
    },
    arbitrum: {
        tvl: async (_, _1, _2, { api }) => {
            return sumTokens2({
                owner: arbitrumOwner,
                tokens: arbitrumTokens,
                api,
            });
        },
    },
    avax: {
        tvl: async (_, _1, _2, { api }) => {
            return sumTokens2({ owner: avaxOwner, tokens: avaxTokens, api });
        },
    },
    polygon_zkevm: {
        tvl: async (_, _1, _2, { api }) => {
            return sumTokens2({
                owner: polygonZkEVMOwner,
                tokens: polygonZkEVMTokens,
                api,
            });
        },
    },
};
