const sdk = require('@defillama/sdk')

const PURE_TOKEN_ADAPTER = "0x62DD06026F5f8e874eEfF362b1280CD9A2057b7d"
const UNION_TOKEN = "0x5Dfe42eEA70a3e6f93EE54eD9C321aF07A85535C"
const UDAI = "0x954F20DF58347b71bbC10c94827bE9EbC8706887"


async function tvl(_timestamp, ethBlock){
    const supply = await sdk.api.erc20.totalSupply({
        target: UNION_TOKEN,
        block: ethBlock
    })
    return {
        [UNION_TOKEN]: supply.output
    }
}

module.exports = {
    ethereum:{
        tvl
    },
}

// async function tvl(_timestamp, ethBlock){
//     const supply = await sdk.api.abi.call({
//         target: PURE_TOKEN_ADAPTER,
//         block: ethBlock,
//         abi: 'erc20:balanceOf',
//         params: [UNION_TOKEN]
//     })
//     return {
//         [PURE_TOKEN_ADAPTER]: supply.output
//     }
// }

// module.exports = {
//     ethereum:{
//         tvl
//     },
// }