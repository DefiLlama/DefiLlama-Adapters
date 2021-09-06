const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const BigNumber = require('bignumber.js')

const dashboard = '0x3BF0EbF0B846Fff73Df543bACacC542A6CE9fc15'
const qTokens = [
    '0xbE1B5D17777565D67A5D2793f879aBF59Ae5D351', // qBNB
    '0xd055D32E50C57B413F7c2a4A052faF6933eA7927', // qBTC
    '0xb4b77834C73E9f66de57e6584796b034D41Ce39A', // qETH
    '0x1dd6E079CF9a82c91DaF3D8497B27430259d32C2', // qUSDC
    '0x99309d2e7265528dC7C3067004cC4A90d37b7CC3', // qUSDT
    '0x474010701715658fC8004f51860c90eEF4584D2B', // qDAI
    '0xa3A155E76175920A40d2c8c765cbCB1148aeB9D1', // qBUSD
    '0xaB9eb4AE93B705b0A74d3419921bBec97F51b264', // qCAKE
    '0xFF858dB0d6aA9D3fCA13F6341a1693BE4416A550', // qMDX
    '0xcD2CD343CFbe284220677C78A08B1648bFa39865' // qQBT
]

const ZERO = new BigNumber(0)
const ETHER = new BigNumber(10).pow(18)

async function bsc(timestamp, ethBlock, chainBlock) {
    const block = chainBlock.bsc
    const total = (await sdk.api.abi.multiCall({
        calls: qTokens.map(address => ({
            target: dashboard,
            params: [[address]]
        })),
        block,
        abi: abi,
        chain: 'bsc'
    })).output.reduce((tvl, call) => tvl.plus(new BigNumber(call.output)), ZERO)
    
    return {
        'tether': total.dividedBy(ETHER).toNumber()
    }
}

module.exports = {
    bsc: {
        tvl: bsc
    },
    tvl: sdk.util.sumChainTvls([bsc])
}