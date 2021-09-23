const sdk = require("@defillama/sdk");
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')
const {transformPolygonAddress} = require('../helper/portedTokens')
const axios = require('axios')

const maitFarm = '0x539618aa29c95c28c0b04abb9025815c014a9db9'
const treasury = '0xe444a7d44065b06ac551623d56ba610a44a20013'

async function tvl(timestamp, block, chainBlocks) {
    let balances = {}
    let lpPositions = []
    let transformAddress = await transformPolygonAddress()
    let maitFarmTokens = (await axios.get(`https://api.covalenthq.com/v1/137/address/${maitFarm}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`)).data.data.items
    let treasuryTokens = (await axios.get(`https://api.covalenthq.com/v1/137/address/${treasury}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`)).data.data.items

    await Promise.all(
        treasuryTokens.concat(maitFarmTokens).map(async (token) => {
            if(token.contract_ticker_symbol === 'UNI-V2')
            {
                const uniLocked = sdk.api.erc20.balanceOf({
                    target: token.contract_address,
                    owner: maitFarm,
                    block: chainBlocks['polygon'],
                    chain: 'polygon'
                })

                lpPositions.push({
                    token: token.contract_address,
                    balance: (await uniLocked).output
                })
            } else if(token.supports_erc) {
                const singleTokenLocked = sdk.api.erc20.balanceOf({
                    target: token.contract_address,
                    owner: maitFarm,
                    block: chainBlocks['polygon'],
                    chain: 'polygon'

                })
                sdk.util.sumSingleBalance(balances, transformAddress(token.contract_address), (await singleTokenLocked).output)
            }
    }))
    await unwrapUniswapLPs(balances, lpPositions, chainBlocks['polygon'], 'polygon', transformAddress)
    return balances
}

module.exports = {
    polygon: {
        tvl
    },
    tvl
}
