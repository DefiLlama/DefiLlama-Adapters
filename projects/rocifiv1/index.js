const sdk = require("@defillama/sdk");
const { sumTokens2 } = require('../helper/unwrapLPs')

const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const WETH = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"

const ROCI_POOLS = [
    '0x883F10Dc3960493f38F69b8696dC331D22fdEd76',
    '0x8bf2B880B48EA3d1b13677f327c5058480b4e1d0',
    '0x978F89dE413594378a68CB9C14a83CeC0cEC721b'
];

const ROCI_REVENUE_MANAGER = "0x10C9F64289cc5114E8854Cc216aD75a0d19d60b5";

const ROCI_COLLATERAL_MANAGER = "0x6cb3C5e73b9A6B9E5e9745545a0f40c9724e2337";

const RociRevenueManagerABI = {
    "inputs": [
        {
            "internalType": "address",
            "name": "_poolAddress",
            "type": "address"
        }
    ],
    "name": "balanceAvailable",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
}

const poolValueAbi = { "inputs": [], "name": "poolValue", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }

const chain = 'polygon'

async function tvl(timestamp, _, { [chain]: block }) {
    return sumTokens2({
        chain, block, tokensAndOwners: [
            [WETH, ROCI_COLLATERAL_MANAGER],
            [USDC, ROCI_REVENUE_MANAGER],
        ]
    })
}

async function borrowed(timestamp, _, { [chain]: block }) {
    const { output: poolValues } = await sdk.api.abi.multiCall({
        abi: poolValueAbi,
        calls: ROCI_POOLS.map(i => ({ target: i })),
        chain, block,
    })
    const { output: balanceAvailable } = await sdk.api.abi.multiCall({
        target: ROCI_REVENUE_MANAGER,
        abi: RociRevenueManagerABI,
        calls: ROCI_POOLS.map(i => ({ params: i })),
        chain, block,
    })
    let total = 0
    poolValues.forEach(({ output }) => total += +output)
    balanceAvailable.forEach(({ output }) => total -= +output)
    return {
        'usd-coin': total / 1e6
    }
}

module.exports = {
    polygon: {
        tvl,
        borrowed,
    },
};