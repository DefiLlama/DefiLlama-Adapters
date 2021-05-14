const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

// https://docs.belt.fi/contracts/contract-deployed-info
const vaults = [
    '0x51bd63F240fB13870550423D208452cA87c44444',
    '0xAA20E8Cb61299df2357561C2AC2e1172bC68bc25',
    '0xa8Bb71facdd46445644C277F9499Dd22f6F0A30C',
    '0x9171Bf7c050aC8B4cf7835e51F7b4841DFB2cCD0',
    '0x55E1B1e49B969C018F2722445Cd2dD9818dDCC25',
    '0x7a59bf07D529A5FdBab67D597d63d7D5a83E61E5',
    '0x9A86fc508a423AE8a243445dBA7eD5364118AB1D'
]

async function tvl(timestamp, ethBlock, chainBlocks) {
    const underlyingTokens = await sdk.api.abi.multiCall({
        chain: 'bsc',
        calls: vaults.map(v=>({target:v})),
        block: chainBlocks['bsc'],
        abi: abi.token
    })
    const underlyingBalances = await sdk.api.abi.multiCall({
        chain: 'bsc',
        calls: vaults.map(v=>({target:v})),
        block: chainBlocks['bsc'],
        abi: abi.calcPoolValueInToken
    })
    const balances = {}
    underlyingBalances.output.forEach((balance, index)=>{
        sdk.util.sumSingleBalance(balances, 'bsc:'+underlyingTokens.output[index].output, balance.output)
    })
    return balances
}

module.exports = {
    bsc: {
        tvl,
    },
    tvl
}
