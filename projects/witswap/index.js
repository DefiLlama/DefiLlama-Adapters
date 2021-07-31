const sdk = require('@defillama/sdk')

const ewit = "0x56ee175fe37cd461486ce3c3166e0cafccd9843f"

async function tvl(_timestamp, ethBlock){
    const supply = await sdk.api.erc20.totalSupply({
        target: ewit,
        block: ethBlock
    })
    return {
        [ewit]: supply.output
    }
}

module.exports = {
    ethereum:{
        tvl
    },
    tvl
}