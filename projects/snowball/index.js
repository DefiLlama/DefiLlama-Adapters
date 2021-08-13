const sdk = require('@defillama/sdk');
const { unwrapUniswapLPs } = require('../helper/unwrapLPs')
const BigNumber = require('bignumber.js')
const abi = require('./abi.json')

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

const newSnowglobes = ['0x586554828eE99811A8ef75029351179949762c26',
'0x621207093D2e65Bf3aC55dD8Bf0351B980A63815', '0x00933c16e06b1d15958317C2793BC54394Ae356C',
'0x751089F1bf31B13Fa0F0537ae78108088a2253BF', '0x39BE35904f52E83137881C0AC71501Edf0180181',
'0x3fcFBCB4b368222fCB4d9c314eCA597489FE8605', '0xb21b21E4fA802EE4c158d7cf4bD5416B8035c5e0',
'0xdf7F15d05d641dF701D961a38d03028e0a26a42D', '0x888Ab4CB2279bDB1A81c49451581d7c243AffbEf',
'0x27f8FE86a513bAAF18B59D3dD15218Cc629640Fc', '0x3815f36C3d60d658797958EAD8778f6500be16Df',
'0x763Aa38c837f61DD8429313933Cc47f24E881430', '0x392c51Ab0AF3017E3e22713353eCF5B9d6fBDE84',
'0x7987aDB3C789f071FeFC1BEb15Ce6DfDfbc75899', '0x8eDd233546730C51a9d3840e954E5581Eb3fDAB1',
'0xcD651AD29835099334d312a9372418Eb2b70c72F', '0x3270b685A4a61252C6f30c1eBca9DbE622984e22',
'0x14F98349Af847AB472Eb7f7c705Dc4Bee530713B', '0x234ed7c95Be12b2A0A43fF602e737225C83c2aa1',
'0x8309C64390F376fD778BDd701d54d1F8DFfe1F39', '0xa39785a4E4CdDa7509751ed152a00f3D37FbFa9F']

const tokenToCoingeckoId = Object.fromEntries(Object.entries({
    '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7': 'avalanche-2',
    '0xe896CDeaAC9615145c0cA09C8Cd5C25bced6384c': 'penguin-finance',
    '0xC38f41A296A4493Ff429F1238e030924A1542e50': 'snowball-token',
    '0xf20d962a6c8f70c731bd838a3a388D7d48fA6e15': 'ethereum',
    '0x60781C2586D68229fde47564546784ab3fACA982': 'pangolin',
    '0xDC42728B0eA910349ed3c6e1c9Dc06b5FB591f98': 'frax',
    '0x1C20E891Bab6b1727d14Da358FAe2984Ed9B59EB': 'true-usd',
    '0xde3A24028580884448a5397872046a019649b084': 'tether',
    '0xaEb044650278731Ef3DC244692AB9F64C78FfaEA': 'busd',
    '0xbA7dEebBFC5fA1100Fb055a87773e1E99Cd3507a': 'dai',
    '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7': 'avalanche-2', //wavax
    '0xB3fe5374F67D7a22886A0eE082b2E2f9d2651651': 'chainlink',
    '0x39cf1BD5f15fb22eC3D9Ff86b0727aFc203427cc': 'sushi',
    '0x408D4cD0ADb7ceBd1F1A1C33A0Ba2098E1295bAB': 'wrapped-bitcoin',
    '0xf39f9671906d8630812f9d9863bBEf5D523c84Ab': 'uniswap',
    '0x8cE2Dee54bB9921a2AE0A63dBb2DF8eD88B91dD9': 'aave',
    '0x99519AcB025a0e0d44c3875A4BbF03af65933627': 'yearn-finance',
    '0x6e7f5c0b9f4432716bdd0a77a3601291b9d9e985': 'spore-finance-2',
    '0x846d50248baf8b7ceaa9d9b53bfd12d7d7fbb25a': 'verso'
}).map(t=>[t[0].toLowerCase(), t[1]]))

async function convertBalancesToCoingecko(balances) {
    const newBalances = {}
    await Promise.all(Object.entries(balances).map(async ([rawToken, balance]) => {
        const token = rawToken.split(':')[1]
        const decimals = await sdk.api.erc20.decimals(token, 'avax')
        newBalances[tokenToCoingeckoId[token.toLowerCase()]] = BigNumber(balance).div(10 ** Number(decimals.output)).toNumber()
    }))
    return newBalances
}

async function getTokensInSnowglobes(balances, snowglobes, block) {
    const oldCalls = {
        calls: snowglobes.map(address => ({
            target: address,
        })),
        block,
        chain: 'avax'
    }
    const newCalls = {
        ...oldCalls,
        calls: newSnowglobes.map(address => ({
            target: address,
        })),
    }
    const [lpTokens, lpTokenBalances, newLpTokens, newLpTokenBalances] = await Promise.all([
        sdk.api.abi.multiCall({
            ...oldCalls,
            abi: abi.want,
        }),
        sdk.api.abi.multiCall({
            ...oldCalls,
            abi: abi.balanceOf,
        }),
        sdk.api.abi.multiCall({
            ...newCalls,
            abi: abi.token,
        }),
        sdk.api.abi.multiCall({
            ...newCalls,
            abi: abi.balance,
        }),
    ])
    const lpPositions = lpTokens.output.concat(newLpTokens.output).map((lpToken, i) => ({
        token: lpToken.output,
        balance: lpTokenBalances.output.concat(newLpTokenBalances.output)[i].output
    }))
    await unwrapUniswapLPs(balances, lpPositions, block, 'avax', (addr) => `avax:${addr}`)
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
