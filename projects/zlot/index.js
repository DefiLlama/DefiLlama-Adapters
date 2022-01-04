const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

const oldPool = "0x9E4E091fC8921FE3575eab1c9a6446114f3b5Ef2"
const newPool = "0x6eC088B454d2dB7a2d8879A25d9ce015039E30FB"
const hegic = "0x584bC13c7D411c00c01A62e8019472dE68768430"

async function tvl(timestamp, block) {
    return {
        [hegic]: (await sdk.api.abi.call({
            target: newPool,
            abi: abi.totalUnderlying,
            block
        })).output
    }
}


module.exports = {
    ethereum: {
        tvl
    },
    tvl
}
