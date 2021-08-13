const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

const ethCallVault = '0x0fabaf48bbf864a3947bdd0ba9d764791a60467a'
const wbtcCallVault = '0x8b5876f5B0Bf64056A89Aa7e97511644758c3E8c'
const usdcETHPutVault = '0x16772a7f4a3ca291C21B8AcE76F9332dDFfbb5Ef'
const yvUSDCETHPutVault = '0x8FE74471F198E426e96bE65f40EeD1F8BA96e54f'
const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const wbtc = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

async function addVault(balances, vault, token, block) {
    const totalBalance = await sdk.api.abi.call({
        target: vault,
        block,
        abi: abi.totalBalance
    })
    sdk.util.sumSingleBalance(balances, token, totalBalance.output)
}

async function tvl(timestamp, block) {
    const balances = {}
    await Promise.all([
        addVault(balances, ethCallVault, weth, block),
        addVault(balances, wbtcCallVault, wbtc, block),
        addVault(balances, usdcETHPutVault, usdc, block),
        addVault(balances, yvUSDCETHPutVault, usdc, block),
    ])
    return balances
}

module.exports = {
    ethereum: {
        tvl
    },
    tvl
}