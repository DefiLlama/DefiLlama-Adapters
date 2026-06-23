
/*
    tvl = pool + vault stake + contract asset (no count due to oracle)
*/

const ADDRESSES = require('../helper/coreAssets.json')

const CoinPoolAddress = "0x304829862C52BB4A4066e0085395E93439FAC657"
const InsurancePoolAddress = "0x5387733F5f457541a671Fe02923F146b4040530C"
const NeiVaultAddress = "0xeB4985942ec930df8d912205143Fbd9ACa122b13"
const NEDAddress = "0x727E7A24Ad4fae30e37c3A23bEB08b8f4Cf1F375"

async function tvl(api) {
    // Get USDT balance from CoinPool
    const coinPoolBalance = await api.call({
        target: ADDRESSES.arbitrum.USDT,
        abi: 'erc20:balanceOf',
        params: [CoinPoolAddress]
    })

    // Get USDT balance from InsurancePool  
    const insurancePoolBalance = await api.call({
        target: ADDRESSES.arbitrum.USDT,
        abi: 'erc20:balanceOf',
        params: [InsurancePoolAddress]
    })

    // Add USDT balances
    api.add(ADDRESSES.arbitrum.USDT, coinPoolBalance)
    api.add(ADDRESSES.arbitrum.USDT, insurancePoolBalance)

}

async function staking(api) {

    // Get NED token balance in NeiVault
    const nedBalance = await api.call({
        target: NEDAddress,
        abi: 'erc20:balanceOf',
        params: [NeiVaultAddress]
    })

    // Add NED token balance
    api.add(NEDAddress, nedBalance)
}

module.exports = {
    arbitrum: {
        tvl,
        staking
    }
}
