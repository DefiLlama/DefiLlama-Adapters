const sdk = require('@defillama/sdk')
const { default: BigNumber } = require('bignumber.js')

const tradingOld = "0x9BC357bc5b312AaCD41a84F3C687F031B8786853"
const tradingNew = "0xA55Eee92a46A50A4C65908F28A0BE966D3e71633"
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

async function tvl(_time, _ethBlock, chainBlocks){
    const ethLocked = await sdk.api.eth.getBalances({
        targets: [tradingOld, tradingNew],
        chain: 'arbitrum',
        block: chainBlocks.arbitrum
    })
    return {
        [weth]: ethLocked.output.reduce((total, item)=>BigNumber(item.balance).plus(total), 0).toFixed(0)
    }
}

async function treasury(_time, _ethBlock, chainBlocks){
    const ethLocked = await sdk.api.eth.getBalance({
        target: "0x1058afe66bb5b79c295ccce51016586949bc4e8d",
        chain: 'arbitrum',
        block: chainBlocks.arbitrum
    })
    return {
        [weth]: ethLocked.output
    }
}


module.exports={
    methodology: "ETH locked on trading contracts",
    arbitrum:{
        treasury,
        tvl
    }
}