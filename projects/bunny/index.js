const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const BigNumber = require('bignumber.js')

const dashboard = '0xd925cCBE59DA4513cE3389B7Fd6aEDF0F99C0f55'
const pools = [
    '0xb037581cF0cE10b04C4735443d95e0C93db5d940',
    //'0x69FF781Cf86d42af9Bf93c06B8bE0F16a2905cBC', // pool2
    '0xCADc8CB26c8C7cB46500E61171b5F27e9bd7889D',
    '0xEDfcB78e73f7bA6aD2D829bf5D462a0924da28eD',
    '0x7eaaEaF2aB59C2c85a17BEB15B110F81b192e98a',
    '0x3f139386406b0924eF115BAFF71D0d30CC090Bd5',
    '0x0137d886e832842a3B11c568d5992Ae73f7A792e',
    '0xCBd4472cbeB7229278F841b2a81F1c0DF1AD0058',
    '0xE02BCFa3D0072AD2F52eD917a7b125e257c26032',
    '0x41dF17D1De8D4E43d5493eb96e01100908FCcc4f',
    '0x1b6e3d394f1D809769407DEA84711cF57e507B99',
    '0x92a0f75a0f07C90a7EcB65eDD549Fa6a45a4975C',
    '0xC1aAE51746bEA1a1Ec6f17A4f75b422F8a656ee6',
    '0xE07BdaAc4573a00208D148bD5b3e5d2Ae4Ebd0Cc',
    '0xa59EFEf41040e258191a4096DC202583765a43E7',
    '0xa5B8cdd3787832AdEdFe5a04bF4A307051538FF2',
    '0xC0314BbE19D4D5b048D3A3B974f0cA1B2cEE5eF3',
    '0x866FD0028eb7fc7eeD02deF330B05aB503e199d4',
]

const ZERO = new BigNumber(0)
const ETHER = new BigNumber(10).pow(18)

async function tvl(timestamp) {
    const { block } = await sdk.api.util.lookupBlock(timestamp, {
        chain: 'bsc'
      })
    const total = (await sdk.api.abi.multiCall({
        calls: pools.map( address => ({
            target: dashboard,
            params: address
        })),
        block,
        abi: abi,
        chain: 'bsc'
    })).output.reduce((tvl, call) => tvl.plus(new BigNumber(call.output)), ZERO)
    
    return {
        'tether': total.dividedBy(ETHER).toString()
    }
}

module.exports = {
    tvl
}