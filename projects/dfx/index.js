const sdk = require("@defillama/sdk");
const axios = require('axios')

const poolCadc = '0xa6c0cbcaebd93ad3c6c94412ec06aaa37870216d'
const poolEuro = '0x1a4Ffe0DCbDB4d551cfcA61A5626aFD190731347'
const poolXsgd = '0x2baB29a12a9527a179Da88F422cDaaA223A90bD5'
async function tvl(timestamp, block) {
    let balances = {}

    const euroTokens = (await axios.get(`https://api.covalenthq.com/v1/1/address/${poolEuro}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`)).data.data.items
    const xsgdTokens = (await axios.get(`https://api.covalenthq.com/v1/1/address/${poolXsgd}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`)).data.data.items
    const cadcTokens = (await axios.get(`https://api.covalenthq.com/v1/1/address/${poolCadc}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`)).data.data.items

    await Promise.all(
        euroTokens.map( async (token) => {
            if(token.supports_erc) {
                const singleTokenLocked = sdk.api.erc20.balanceOf({
                    target: token.contract_address,
                    owner: poolEuro,
                    block,
                })
                sdk.util.sumSingleBalance(balances, token.contract_address, (await singleTokenLocked).output)
            }
        }),
        cadcTokens.map( async (token) => {
            if(token.supports_erc) {
                const singleTokenLocked = sdk.api.erc20.balanceOf({
                    target: token.contract_address,
                    owner: poolCadc,
                    block,
                })
                sdk.util.sumSingleBalance(balances, token.contract_address, (await singleTokenLocked).output)
            }
        }),
        xsgdTokens.map( async (token) => {
            if(token.supports_erc) {
                const singleTokenLocked = sdk.api.erc20.balanceOf({
                    target: token.contract_address,
                    owner: poolXsgd,
                    block,
                })
                sdk.util.sumSingleBalance(balances, token.contract_address, (await singleTokenLocked).output)
            }
        }),
    )

    return balances
}

module.exports = {
    ethereum: {
        tvl
    },
    tvl
}
