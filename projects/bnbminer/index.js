const sdk = require('@defillama/sdk')

const contract = "0xce93F9827813761665CE348e33768Cb1875a9704"

async function tvl(time, ethBlock, chainBlocks){
    const bnb = await sdk.api.eth.getBalance({
        target: contract,
        chain: 'bsc',
        block: chainBlocks.bsc
    })
    return {
        "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c": bnb.output
    }
}

module.exports={
    methodology: `We count the BNB on ${contract}`,
    tvl
}