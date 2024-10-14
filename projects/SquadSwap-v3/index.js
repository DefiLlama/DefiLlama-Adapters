const { uniV3Export } = require('../helper/uniswapV3')

const bscFactoryAddress = '0x009c4ef7C0e0Dd6bd1ea28417c01Ea16341367c3'
const baseFactoryAddress = '0xa1288b64F2378276d0Cc56F08397F70BecF7c0EA'
const blastFactoryAddress = '0x6Ea64BDCa26F69fdeF36C1137A0eAe5Bf434e8fd'
const arbitrumFactoryAddress = '0x0558921f7C0f32274BB957D5e8BF873CE1c0c671'
const polygonFactoryAddress = '0x633Faf3DAc3677b51ea7A53a81b79AEe944714dc'
const optimismFactoryAddress = '0xa1288b64F2378276d0Cc56F08397F70BecF7c0EA'

module.exports = uniV3Export({
    bsc: { factory: bscFactoryAddress, fromBlock: 34184408 },
    base: { factory: baseFactoryAddress, fromBlock: 19730499 },
    blast: { factory: blastFactoryAddress, fromBlock: 5644236 },
    arbitrum: { factory: arbitrumFactoryAddress, fromBlock: 253170358 },
    polygon: { factory: polygonFactoryAddress, fromBlock: 61864971 },
    optimism: { factory: optimismFactoryAddress, fromBlock: 125326692 },
})
