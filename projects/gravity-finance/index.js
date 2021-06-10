const sdk = require("@defillama/sdk");
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')
const {transformPolygonAddress} = require('../helper/portedTokens')
const axios = require('axios')
const gfiUsdFarm = '0xE6584E2432ef0b82A39C383e895E7e031655F2Bf'
const gfiWethFarm = '0xEf943A1B9A5E697Eb26B1cfc5e9225D2Aa00395a'
const gfiFarm = '0xf9FBfA8Fd7568D39E1b2091379499B48EA2F4c72'
const chainLinkFarm = '0x2b1966652Aa0c09a2f34cE3FbeB19d945dEB8FA3'
const sushiFarm = '0x0Dbe8999Cde32164340411897a7DD73654F82571'

async function tvl(timestamp, block, chainBlocks) {
    const balances = {}
    let lpPositions = []
    let transformAddress = await transformPolygonAddress()
    let gfiUsdTokens = (await axios.get(`https://api.covalenthq.com/v1/137/address/${gfiUsdFarm}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`)).data.data.items
    let gfiWethTokens = (await axios.get(`https://api.covalenthq.com/v1/137/address/${gfiWethFarm}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`)).data.data.items
    let gfiTokens = (await axios.get(`https://api.covalenthq.com/v1/137/address/${gfiFarm}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`)).data.data.items
    let chainLinkTokens = (await axios.get(`https://api.covalenthq.com/v1/137/address/${chainLinkFarm}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`)).data.data.items
    let sushiTokens = (await axios.get(`https://api.covalenthq.com/v1/137/address/${sushiFarm}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`)).data.data.items

    await Promise.all(
        gfiUsdTokens.map(async (token) => {
        if(token.contract_ticker_symbol === 'UNI-V2')
        {
            const uniLocked = sdk.api.erc20.balanceOf({
                target: token.contract_address,
                owner: gfiUsdFarm,
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
                owner: gfiUsdFarm,
                block: chainBlocks['polygon'],
                chain: 'polygon'

            })
            sdk.util.sumSingleBalance(balances, transformAddress(token.contract_address), (await singleTokenLocked).output)
        }
     }),
     gfiWethTokens.map(async (token) => {
         if(token.contract_ticker_symbol === 'UNI-V2')
         {
             const uniLocked = sdk.api.erc20.balanceOf({
                 target: token.contract_address,
                 owner: gfiWethFarm,
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
                 owner: gfiWethFarm,
                 block: chainBlocks['polygon'],
                 chain: 'polygon'

             })
             sdk.util.sumSingleBalance(balances, transformAddress(token.contract_address), (await singleTokenLocked).output)
         }
     }),
     gfiTokens.map(async (token) => {
         if(token.supports_erc) {
             const singleTokenLocked = sdk.api.erc20.balanceOf({
                 target: token.contract_address,
                 owner: gfiFarm,
                 block: chainBlocks['polygon'],
                 chain: 'polygon'

             })
             sdk.util.sumSingleBalance(balances, transformAddress(token.contract_address), (await singleTokenLocked).output)
         }
     }),
     chainLinkTokens.map(async (token) => {
         if(token.supports_erc) {
             const singleTokenLocked = sdk.api.erc20.balanceOf({
                 target: token.contract_address,
                 owner: chainLinkFarm,
                 block: chainBlocks['polygon'],
                 chain: 'polygon'

             })
             sdk.util.sumSingleBalance(balances, transformAddress(token.contract_address), (await singleTokenLocked).output)
         }
     }),
     sushiTokens.map(async (token) => {
         if(token.supports_erc) {
             const singleTokenLocked = sdk.api.erc20.balanceOf({
                 target: token.contract_address,
                 owner: sushiFarm,
                 block: chainBlocks['polygon'],
                 chain: 'polygon'

             })
             sdk.util.sumSingleBalance(balances, transformAddress(token.contract_address), (await singleTokenLocked).output)
         }
     })
    )

    await unwrapUniswapLPs(balances, lpPositions, chainBlocks['polygon'], 'polygon', transformAddress)
    return balances
}

module.exports = {
    polygon: {
        tvl
    },
    tvl
}
