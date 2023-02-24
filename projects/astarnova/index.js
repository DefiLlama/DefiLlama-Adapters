const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')

const dashboard = '0x63d3b2d066c1247245B31252441B3B6744e5BeB1'
const pools = [
    '0x2426F33359ef3BC6cb80104D3e2C81D81c790D6F',
    '0x3ad9F054454E948D0016aaa568D05b22CE1B7b37',
    '0xa573fd50404ffFa247Ea5B74ecC24EB9574300F0',
    '0xf1819937dE70179D0dcBf81dDBe372e5b5A4F1Fc',
    '0xe1bA9549DCf544c225BF7352803814fA8248F53F',
    '0x344fd0308a00db704b05Bd95760160C660787a38',
    '0x8b332a0EaEe5F774AfB344D39D1F643f2B98Db80',
    '0x5a28E0a888bf710248Ab27914168b2EB7F930cb8',
    '0x812A2EB0094aCB81337150E768De9CAbc13E1580',
    '0xd854566C787548172Ada3e17724045107b2412C3',
    '0x989f69D2C64E53f93DBfb5cE1eC62294f915Bc0C'
]

const ZERO = new BigNumber(0)
const USDC = new BigNumber(10).pow(6)

async function astar(timestamp, ethBlock, chainBlock) {
    const block = chainBlock.astar
    const total = (await sdk.api.abi.multiCall({
        calls: pools.map( address => ({
            target: dashboard,
            params: address
        })),
        block,
        abi: 'function tvlOfPool(address pool) view returns (uint256 tvl)',
        chain: 'astar'
    })).output.reduce((tvl, call) => tvl.plus(new BigNumber(call.output)), ZERO)
        
    return {
        'tether': total.dividedBy(USDC).toNumber()
    }
}

module.exports = {
    misrepresentedTokens: true,
    astar:{
        tvl: astar
    },
}
