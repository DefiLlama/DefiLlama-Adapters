const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require("../helper/unknownTokens");

const CONTRACTS = {
    factory: '0x0FEFaB571c8E69f465103BeC22DEA6cf46a30f12',
    yieldBoostVault: '0x749F5fB1Ea41D53B82604975fd82A22538DaB65a',
    lemonToken: '0xfB5D8892297Bf47F33C5dA9B320F9D74c61955F7',
    lemonadWmon: '0x48b43c8f46509a27454a4992db656cd60c455e38',
}

async function tvl(api) {

    const uniTvl = getUniTVL({
        factory: CONTRACTS.factory,
        useDefaultCoreAssets: true,
    })

    const balances = await uniTvl(api)

    // Map Lemonad's custom WMON to official WMON for pricing
    const lemonadWmonKey = `monad:${CONTRACTS.lemonadWmon.toLowerCase()}`
    if (balances[lemonadWmonKey]) {
        const officialWmonKey = `monad:${ADDRESSES.monad.WMON.toLowerCase()}`
        balances[officialWmonKey] = (BigInt(balances[officialWmonKey] || 0) + BigInt(balances[lemonadWmonKey])).toString()
        delete balances[lemonadWmonKey]
    }

    return balances
}

async function staking(api) {
    const vaultBalance = await api.call({
        abi: 'uint256:totalStaked',
        target: CONTRACTS.yieldBoostVault,
    })
    api.add(CONTRACTS.lemonToken, vaultBalance)
}

module.exports = {
    misrepresentedTokens: true,
    methodology: 'TVL includes liquidity in DEX pools and LEMON staked in YieldBoostVault.',
    monad: { tvl, staking },
}