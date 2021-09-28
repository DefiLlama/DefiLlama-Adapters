const sdk = require('@defillama/sdk')

const trading = "0x9BC357bc5b312AaCD41a84F3C687F031B8786853"
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

async function tvl(_time, _ethBlock, chainBlocks){
    const ethLocked = await sdk.api.eth.getBalance({
        target: trading,
        chain: 'arbitrum',
        block: chainBlocks.arbitrum
    })
    return {
        [weth]: ethLocked.output
    }
}

module.exports={
    tvl
}