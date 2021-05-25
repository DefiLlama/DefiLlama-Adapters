const sdk = require('@defillama/sdk');
const { unwrapUniswapLPs } = require('../helper/unwrapLPs')
const BigNumber = require('bignumber.js')
const abi = require("./abi.json")

// StableVault swap contracts - https://snowballs.gitbook.io/snowball-docs/snowball-contracts/stablevault-contracts
const stablevaults = ['0x6B41E5c07F2d382B921DE5C34ce8E2057d84C042', '0x05c5DB43dB72b6E73702EEB1e5b62A03a343732a']
// https://snowballs.gitbook.io/snowball-docs/snowball-contracts/current-snowglobes
const snowglobes = ['0x6b32266e7793359Fa199C32e950cF5c0EB4b284A', '0x08d8C7C1a6E8543a4674E77cc0111EAa1D520f8b',
    '0x846E79A9d8CCC6bBafc3939177a3D53E51C634FC', '0x1b4468dC172B94B7B8307ca5b1f63466b086acc8',
    '0x2edC6522d658946fBA5116fFaA60d8760d1B21A8', '0x961890586dfB84919d8C6C5f6304192A2b3ddaB7',
    '0xe6D5806B2248777761adE4Bc4f38E9AAB6Bf9BC2', '0x6eb9CB199C55De50279a69705BA88C146FADC574',
    '0x9B3298Dba29A1Fc7061A4eF9b360eAa12879C911', '0xafbA321B14A22501466d18eA0D9616f8e90Fc378',
    '0xe11248e5c0a98038633603F291267b74183AB7be', '0xe11248e5c0a98038633603F291267b74183AB7be',
    '0xdC3F53a364BE3b38d6f8e6a087f61cb2af58FC51', '0x53a6fFE10AdB8db0D861BF264134D42CAC03a1Bd',
    '0x47F884e0bfC0e56eCDc581e2774efeC12874f7FD', '0x8eE25bdfe0B749B78157505B92bd919414Af696c',
    '0x93bc576943Ef7452888dD810f502595Ee83187EE']

const tokenToCoingeckoId = {
    '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7': 'avalanche-2',
    '0xe896CDeaAC9615145c0cA09C8Cd5C25bced6384c': 'penguin-finance',
    '0xC38f41A296A4493Ff429F1238e030924A1542e50': 'snowball-token',
    '0xf20d962a6c8f70c731bd838a3a388D7d48fA6e15': 'ethereum',
    '0x60781C2586D68229fde47564546784ab3fACA982': 'pangolin',
    "0xDC42728B0eA910349ed3c6e1c9Dc06b5FB591f98": 'frax',
    '0x1C20E891Bab6b1727d14Da358FAe2984Ed9B59EB': 'true-usd',
    '0xde3A24028580884448a5397872046a019649b084': 'tether',
    "0xaEb044650278731Ef3DC244692AB9F64C78FfaEA": 'busd',
    "0xbA7dEebBFC5fA1100Fb055a87773e1E99Cd3507a": 'dai',
    "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7": 'avalanche-2', //wavax
    "0xB3fe5374F67D7a22886A0eE082b2E2f9d2651651": 'chainlink',
    "0x39cf1BD5f15fb22eC3D9Ff86b0727aFc203427cc": 'sushi',
    "0x408D4cD0ADb7ceBd1F1A1C33A0Ba2098E1295bAB": 'wrapped-bitcoin',
    "0xf39f9671906d8630812f9d9863bBEf5D523c84Ab": "uniswap",
    "0x8cE2Dee54bB9921a2AE0A63dBb2DF8eD88B91dD9": 'aave',
    "0x99519AcB025a0e0d44c3875A4BbF03af65933627": 'yearn-finance'
}

async function convertBalancesToCoingecko(balances) {
    const newBalances = {}
    await Promise.all(Object.entries(balances).map(async ([rawToken, balance]) => {
        const token = rawToken.split(':')[1]
        const decimals = await sdk.api.erc20.decimals(token, 'avax')
        newBalances[tokenToCoingeckoId[token]] = BigNumber(balance).div(10 ** Number(decimals.output)).toNumber()
    }))
    return newBalances
}

async function getTokensInSnowglobes(balances, snowglobes, block) {
    const [lpTokens, lpTokenBalances] = await Promise.all([
        sdk.api.abi.multiCall({
            calls: snowglobes.map(address => ({
                target: address,
            })),
            abi: abi.want,
            block,
            chain: 'avax'
        }),
        sdk.api.abi.multiCall({
            calls: snowglobes.map(address => ({
                target: address,
            })),
            abi: abi.balanceOf,
            block,
            chain: 'avax'
        }),
    ])
    await unwrapUniswapLPs(balances, lpTokens.output.map((lpToken, i) => ({
        token: lpToken.output,
        balance: lpTokenBalances.output[i].output
    })), block, 'avax', (addr) => `avax:${addr}`)
}

async function getBalancesOnStableVault(balances, address, block) {
    const tokens = await sdk.api.abi.multiCall({
        calls: [0, 1, 2].map(num => ({
            target: address,
            params: [num]
        })),
        abi: abi.getToken,
        block,
        chain: 'avax'
    })
    const tokenBalances = await sdk.api.abi.multiCall({
        calls: tokens.output.map(token => ({
            target: token.output,
            params: [address]
        })),
        abi: 'erc20:balanceOf',
        block,
        chain: 'avax'
    })
    const balancesToAdd = {}
    sdk.util.sumMultiBalanceOf(balancesToAdd, tokenBalances)
    Object.entries(balancesToAdd).forEach(balance => {
        sdk.util.sumSingleBalance(balances, `avax:${balance[0]}`, balance[1])
    })
}

async function tvl(_timestamp, _ethereumBlock, chainBlocks) {
    const balances = {}
    await Promise.all(stablevaults.map(vault => getBalancesOnStableVault(balances, vault, chainBlocks['avax'])))
    await getTokensInSnowglobes(balances, snowglobes, chainBlocks['avax'])
    return await convertBalancesToCoingecko(balances)
}

module.exports = {
    avalanche: {
        tvl,
    },
    tvl
}
