const sdk = require('@defillama/sdk')
const {staking} = require('../helper/staking')
const {getBlock} = require('../helper/getBlock')
const {pool2} = require('../helper/pool2')

const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
async function tvl(time, _ethBlock, chainBlocks){
    const block = await getBlock(time, 'arbitrum', chainBlocks)
    const eth = await sdk.api.eth.getBalance({
        target: '0x9F7968de728aC7A6769141F63dCA03FD8b03A76F',
        block,
        chain: 'arbitrum'
    })
    return {
        [weth]: eth.output
    }
}

module.exports = {
    /*
    staking:{
        tvl: staking("0x32e5594F14de658b0d577D6560fA0d9C6F1aa724", "0xed3fb761414da74b74f33e5c5a1f78104b188dfc", "arbitrum", "arbitrum:0x70df9dd83be2a9f9fcc58dd7c00d032d007b7859")
    },
    pool2:{
        tvl: pool2("0x62FF5Be795262999fc1EbaC29277575031d2dA2C", "0x70df9dd83be2a9f9fcc58dd7c00d032d007b7859", "arbitrum", addr=>`arbitrum:${addr}`)
    },
    */
    tvl
}