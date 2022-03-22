const sdk = require('@defillama/sdk')

const ewit = "0xc98a910ede52e7d5308525845f19e17470dbccf7"

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
}
