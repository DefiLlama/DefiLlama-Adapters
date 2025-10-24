const ADDRESSES = require('../helper/coreAssets.json')
const { pool2 } = require("../helper/pool2.js");
const { stakings } = require('../helper/staking');
const { sumTokensExport } = require('../helper/unwrapLPs')

const arbConfig = {
    chain: 'arbitrum',
    contracts: ['0x11920f139a3121c2836e01551d43f95b3c31159c'],
    stakingContracts: ['0x7436750e80bB956C6488A879D573cA417D6712A2', '0x80EF7E080EfC299cd6a7Ed8341273d935252c896'],
    lpContracts: ['0xb18e2e8B2f6C4f3f2e5afc1229d9d7654B0DdAA3'],
    lpAddresses: ['0x11920f139a3121c2836e01551d43f95b3c31159c', ADDRESSES.arbitrum.USDT]
};

const ethConfig = {
    chain: 'ethereum',
    contracts: ['0x9d9535Dae62F5f12aB83F1183DCa1eAd244b0DB3'],
    lpContracts: ['0xe81940eCdEFc9464082B51ACE7ADeD83a1dC1EFc'],
    lpAddresses: ['0x9d9535Dae62F5f12aB83F1183DCa1eAd244b0DB3', ADDRESSES.ethereum.WETH]
};

const tvl = (config) => async (api) => {
    return sumTokensExport({
        owners: config.stakingContracts,
        tokens: config.contracts,
        chain: config.chain
    })
};

module.exports = {
    timetravel: false,
    misrepresentedTokens: false,
    methodology: `
        TVL includes all YBR tokens locked in YieldBricks staking pools on Arbitrum.
        Pool2 covers LP tokens staked in the YieldBricks LP contracts.
    `,
    arbitrum: {
        tvl: () => ({}),
        pool2: pool2(arbConfig.lpContracts, arbConfig.lpAddresses, arbConfig.chain),
        staking: stakings(arbConfig.stakingContracts, arbConfig.contracts, arbConfig.chain)
    },
    ethereum: {
        tvl: () => ({}),
        pool2: pool2(ethConfig.lpContracts, ethConfig.lpAddresses, ethConfig.chain),
        staking: () => ({})
    }
}
