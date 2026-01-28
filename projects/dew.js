const { default: BigNumber } = require('bignumber.js')
const { sumSingleBalance, call } = require('./helper/chain/near')

const rNEAR = "lst.rhealab.near";
const USDC = "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1";
const USDT = "usdt.tether-token.near";
const VAULTS = [
    { 
        contract_id: "dew-rneardefi-vault.near",
        asset: { FungibleToken: { contract_id: rNEAR }}
    },
    {
        contract_id: "usdc.meteor-vaults.near",
        asset: { FungibleToken: { contract_id: USDC }}
    },
    {
        contract_id: "usdt.meteor-vaults.near",
        asset: { FungibleToken: { contract_id: USDT }}
    }
]

async function tvl() {
    const balances = {}

    await Promise.all(VAULTS.map(async (vault) => {
        const isDewNear = vault.contract_id === "dew-rneardefi-vault.near"
        const sharePriceMethod = isDewNear ? "get_exchange_rate" : "get_share_price_in_asset"
        const sharePriceScaleMethod = isDewNear ? "get_exchange_rate_scale" : "get_share_price_scale"

        const totalShares = await call(vault.contract_id, 'ft_total_supply', {})
        const exchangeRateScale = await call(vault.contract_id, sharePriceScaleMethod, {})
        const extraDecimalScale = await call(vault.contract_id, "get_extra_decimal_scale", {})
        const exchangeRate = await call(vault.contract_id, sharePriceMethod, { asset: vault.asset })

        const supplied = BigNumber(totalShares).times(BigNumber(exchangeRate)).div(BigNumber(exchangeRateScale)).div(BigNumber(extraDecimalScale));
        sumSingleBalance(balances, vault.asset.FungibleToken.contract_id, supplied)
    }))

    return balances
}

module.exports = {
    near: {
        tvl: tvl
    }
}