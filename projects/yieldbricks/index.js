const { sumTokensExport } = require('../helper/unwrapLPs')
const { stakings } = require("../helper/staking");

const ARB_CONTRACTS_YBR = ["0x11920f139a3121c2836e01551d43f95b3c31159c"]
const ARB_STAKING_POOLS = ["0x7436750e80bB956C6488A879D573cA417D6712A2", "0x80EF7E080EfC299cd6a7Ed8341273d935252c896"]

const ARB_LP_CONTRACTS = ["0xb18e2e8B2f6C4f3f2e5afc1229d9d7654B0DdAA3"]
const ARB_LP_ADDRESSES = ["0x11920f139a3121c2836E01551D43F95B3c31159c", "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"]

const ETH_LP_CONTRACTS = ["0xe81940eCdEFc9464082B51ACE7ADeD83a1dC1EFc"]
const ETH_LP_ADDRESSES = ["0x9d9535Dae62F5f12aB83F1183DCa1eAd244b0DB3", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"]

module.exports = {
    timetravel: false,
    misrepresentedTokens: false,
    methodology: `
        TVL includes all YBR tokens locked in YieldBricks staking pools on Arbitrum.
        Pool2 covers LP tokens staked in the YieldBricks LP contracts.
    `,
    arbitrum: {
        tvl: sumTokensExport({
            owners: ARB_STAKING_POOLS,
            tokens: ARB_CONTRACTS_YBR,
            chain: 'arbitrum'
        }),
        pool2: stakings(ARB_LP_CONTRACTS, ARB_LP_ADDRESSES, 'arbitrum'),
    },
    ethereum: {
        tvl: () => ({}),
        pool2: stakings(ETH_LP_CONTRACTS, ETH_LP_ADDRESSES, 'ethereum'),
    }
}
