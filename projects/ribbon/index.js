const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

const ethCallVault = '0x0fabaf48bbf864a3947bdd0ba9d764791a60467a'
const wbtcCallVault = '0x8b5876f5B0Bf64056A89Aa7e97511644758c3E8c'
const usdcETHPutVault = '0x16772a7f4a3ca291C21B8AcE76F9332dDFfbb5Ef'
const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const wbtc = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

async function tvl(timestamp, block) {
    const totalBalanceETH = await sdk.api.abi.call({
        target: ethCallVault,
        block,
        abi: abi.totalBalance
    })
    const totalBalanceWBTC = await sdk.api.abi.call({
        target: wbtcCallVault,
        block,
        abi: abi.totalBalance
    })
    const totalBalanceUSDC = await sdk.api.abi.call({
        target: usdcETHPutVault,
        block,
        abi: abi.totalBalance
    })
    return {
        [weth]: totalBalanceETH.output,
        [wbtc]: totalBalanceWBTC.output,
        [usdc]: totalBalanceUSDC.output,
    }
}

module.exports = {
    ethereum:{
        tvl
    },
    tvl
  }