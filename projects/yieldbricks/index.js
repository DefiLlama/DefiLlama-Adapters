const ADDRESSES = require('../helper/coreAssets.json')
const { pool2 } = require("../helper/pool2.js");
const { stakings } = require('../helper/staking');

const arbConfig = {
    chain: 'arbitrum',
    contracts: [ADDRESSES.arbitrum.YBR],
    stakingContracts: ['0x7436750e80bB956C6488A879D573cA417D6712A2', '0x80EF7E080EfC299cd6a7Ed8341273d935252c896'],
    lpContracts: ['0xb18e2e8B2f6C4f3f2e5afc1229d9d7654B0DdAA3'],
    lpAddresses: [ADDRESSES.arbitrum.YBR, ADDRESSES.arbitrum.USDT]
};

const ethConfig = {
    chain: 'ethereum',
    contracts: [ADDRESSES.ethereum.YBR],
    lpContracts: ['0xe81940eCdEFc9464082B51ACE7ADeD83a1dC1EFc'],
    lpAddresses: [ADDRESSES.ethereum.YBR, ADDRESSES.ethereum.WETH]
};

const tvl = (chain) => async (api) => {
    //const tokens = await api.call({ target: chain.tokenList });
    //const toa = tokens.map((token) => [token, chain.depositContract]);
    return 0 // api.sumTokens({ tokensAndOwners: toa });
};

module.exports = {
    timetravel: false,
    misrepresentedTokens: false,
    methodology: `
        TVL includes all YBR tokens locked in YieldBricks staking pools on Arbitrum.
        Pool2 covers LP tokens staked in the YieldBricks LP contracts.
    `,
    arbitrum: {
        tvl: tvl(arbConfig),
        pool2: pool2(arbConfig.lpContracts, arbConfig.lpAddresses, arbConfig.chain),
        staking: stakings(arbConfig.stakingContracts, arbConfig.contracts, arbConfig.chain)
    },
    ethereum: {
        tvl: () => ({}),
        pool2: pool2(ethConfig.lpContracts, ethConfig.lpAddresses, ethConfig.chain),
        staking: () => ({})
    }
}