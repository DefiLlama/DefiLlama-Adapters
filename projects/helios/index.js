const sdk = require('@defillama/sdk')

const index = '0x7633Da43dFd4Ee5A5da99740F077ca9d97aA0d0e'

async function tvl(_time, block){
    const supply = await sdk.api.erc20.totalSupply({
        target: index,
        block
    })
    return {
        [index]: supply.output
    }
}

module.exports={
    tvl
}