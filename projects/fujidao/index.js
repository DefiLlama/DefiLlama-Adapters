const {sumTokens} = require('../helper/unwrapLPs')
const abi = require('./abi.json')
const sdk = require('@defillama/sdk')
const { default: BigNumber } = require('bignumber.js')

const contract = "0x1Cf24e4eC41DA581bEe223E1affEBB62a5A95484"
const ids = [0,2,4]
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

async function tvl(_timestamp, block){
    const supplies = await sdk.api.abi.multiCall({
        abi: abi.totalSupply,
        calls: ids.map(id=>({
            target:contract,
            params: [id]
        })),
        block
    })

    return {
        [weth]: supplies.output.reduce((t,v)=>t.plus(v.output), BigNumber(0)).toFixed(0)
    }
}

module.exports = {
    tvl,
    methodology: "Counts the c-tokens on all vaults, "
}