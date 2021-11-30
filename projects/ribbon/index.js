const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

// Vaults
const ethCallVault = '0x0fabaf48bbf864a3947bdd0ba9d764791a60467a'
const ethCallVaultV2 = '0x25751853Eab4D0eB3652B5eB6ecB102A2789644B'
const wbtcCallVault = '0x8b5876f5B0Bf64056A89Aa7e97511644758c3E8c'
const wbtcCallVaultV2 = '0x65a833afDc250D9d38f8CD9bC2B1E3132dB13B2F'
const usdcETHPutVault = '0x16772a7f4a3ca291C21B8AcE76F9332dDFfbb5Ef'
const yvUSDCETHPutVault = '0x8FE74471F198E426e96bE65f40EeD1F8BA96e54f'
const aaveCallVault = '0xe63151A0Ed4e5fafdc951D877102cf0977Abd365'
const stETHCallVault = '0x53773E034d9784153471813dacAFF53dBBB78E8c'

// Assets
const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const wbtc = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const aave = '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9'

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
        addVault(balances, ethCallVaultV2, weth, block),
        addVault(balances, wbtcCallVault, wbtc, block),
        addVault(balances, wbtcCallVaultV2, wbtc, block),
        addVault(balances, usdcETHPutVault, usdc, block),
        addVault(balances, yvUSDCETHPutVault, usdc, block),
        addVault(balances, aaveCallVault, aave, block),
        addVault(balances, stETHCallVault, weth, block),
    ])
    return balances
}

module.exports = {
    ethereum: {
        tvl
    },
    tvl
}
