const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

const thetaVault = '0x0fabaf48bbf864a3947bdd0ba9d764791a60467a'
const wbtcVault = '0x8b5876f5B0Bf64056A89Aa7e97511644758c3E8c'
const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const wbtc = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'

async function tvl(timestamp, block) {
    const totalBalanceETH = await sdk.api.abi.call({
        target: thetaVault,
        block,
        abi: abi.totalBalance
    })
    const totalBalanceWBTC = await sdk.api.abi.call({
        target: wbtcVault,
        block,
        abi: abi.totalBalance
    })
    return {
        [weth]: totalBalanceETH.output,
        [wbtc]: totalBalanceWBTC.output
    }
}

module.exports = {
    ethereum:{
        tvl
    },
    tvl
  }