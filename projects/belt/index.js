const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

// https://docs.belt.fi/contracts/contract-deployed-info
const bscVaults = [
    '0x51bd63F240fB13870550423D208452cA87c44444',
    '0xAA20E8Cb61299df2357561C2AC2e1172bC68bc25',
    '0xa8Bb71facdd46445644C277F9499Dd22f6F0A30C',
    '0x9171Bf7c050aC8B4cf7835e51F7b4841DFB2cCD0',
    '0x55E1B1e49B969C018F2722445Cd2dD9818dDCC25',
    '0x7a59bf07D529A5FdBab67D597d63d7D5a83E61E5',
    '0x9A86fc508a423AE8a243445dBA7eD5364118AB1D'
]

const hecoVaults = [
    '0x4Cd59EEB3a4D2fa5c35FD3dE0BA1723EeaF1D258',
    '0xB1493B7bc8e260B0b25235ae5c34B0dC201ce8C3',
    '0x86f5C8EB736c95dd687182779edd792FEF0fA674',
    '0xA8714b9c86Fb590bF2CEE12bdFccC575aB454272',
    '0xC04a84d0E3f290D0777c233E0945678469adF353',
    '0x9bC7a8ec3a8b9d9AEc0C5808456e35A934f457e5',
    '0x0e564BC863c2072C47FB8f952062BD5bc673E142'
]

async function getTvl(chain, block, address) {
    const underlyingTokens = await sdk.api.abi.multiCall({
        chain: chain,
        calls: address.map(v=>({target:v})),
        block,
        abi: abi.token
    })
    const underlyingBalances = await sdk.api.abi.multiCall({
        chain: chain,
        calls: address.map(v=>({target:v})),
        block,
        abi: abi.calcPoolValueInToken
    })
    const balances = {}
    underlyingBalances.output.forEach((balance, index)=>{
        sdk.util.sumSingleBalance(balances, chain+':'+underlyingTokens.output[index].output, balance.output)
    })
    return balances
}

function bscTvl(timestamp, ethBlock, chainBlocks) {
    return getTvl('bsc', chainBlocks['bsc'], bscVaults)
}

function hecoTvl(timestamp, ethBlock, chainBlocks) {
    return getTvl('heco', chainBlocks['heco'], hecoVaults)
}

module.exports = {
    bsc: {
        tvl: bscTvl,
    },
    heco: {
        tvl: hecoTvl,
    },
    tvl: sdk.util.sumChainTvls([bscTvl, hecoTvl]),
}
