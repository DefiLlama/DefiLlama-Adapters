const sdk = require('@defillama/sdk')
const {getBlock} = require('../helper/getBlock')

const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
async function tvl(time, _ethBlock, chainBlocks){
    const block = await getBlock(time, 'optimism', chainBlocks)
    const eth = await sdk.api.eth.getBalance({
        target: '0x6F7Fe8b33358a3F4313421186b98CA78127C6DB6',
        block,
        chain: 'optimism'
    })
    return {
        [weth]: eth.output
    }
}

module.exports = {
    tvl
}
