const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const BigNumber = require('bignumber.js')

const dashboard = '0xFA71FD547A6654b80c47DC0CE16EA46cECf93C02'
const pools = [
    // polyBUNNY
    '0x10C8CFCa4953Bc554e71ddE3Fa19c335e163D7Ac',
    '0x7a526d4679cDe16641411cA813eAf7B33422501D',
    '0x6b86aB330F18E8FcC4FB214C91b1080577df3513',
    // qPool
    '0x4beB900C3a642c054CA57EfCA7090464082e904F',
    '0x54E1feE2182d0d96D0D8e592CbFd4debC8EEf7Df',
    '0x3cba7b58b4430794fa7a37F042bd54E3C2A351A8',
    '0x4964e4d8E17B86e15A2f0a4D8a43D8E4AbeC3E78',
    '0xf066208Fb16Dc1A06e31e104bEDb187468206a92',
    '0xB0621a46aFd14C0D1a1F8d3E1021C4aBCcd02F5b',
    '0x95aF402e9751f665617c3F9037f00f91ec00F7b6',
    '0x29270e0bb9bD89ce4febc2fBd72Cd7EB53C0aDD7',
    '0xE94096Fb06f60C7FC0d122A352154842384F80bd',
    '0x58918F94C14dD657f0745f8a5599190f5baDFa05',
    '0x4ee929E9b25d00E6C7FCAa513C01311Da40462F2',
    '0x560F866fE4e1E6EA20701B9dCc9555486E1B84c2',
    '0x470Be517cBd063265c1A519aE186ae82d10dD360',
    
]

const ZERO = new BigNumber(0)
const ETHER = new BigNumber(10).pow(18)

async function tvl(timestamp) {
    const { block } = await sdk.api.util.lookupBlock(timestamp, {
        chain: 'polygon'
      })
    const total = (await sdk.api.abi.multiCall({
        calls: pools.map( address => ({
            target: dashboard,
            params: address
        })),
        block,
        abi: abi,
        chain: 'polygon'
    })).output.reduce((tvl, call) => tvl.plus(new BigNumber(call.output)), ZERO)

    return {
        'tether': total.dividedBy(ETHER).toNumber()
    }
}

module.exports = {
    tvl
}
