const { sumSingleBalance, call } = require('./helper/chain/near')

const VAULT_CONTRACT = "dew-rneardefi-vault.near"

async function tvl() {
    const balances = {}

    const totalShares = await call(VAULT_CONTRACT, 'ft_total_supply', {})
    const exchangeRateScale = await call(VAULT_CONTRACT, 'get_exchange_rate_scale', {})
    const rNearExchangeRate = await call(VAULT_CONTRACT, 'get_exchange_rate', {
        asset: {
            FungibleToken: {
                contract_id: "lst.rhealab.near"
            }
        }
    })

    const rNearSupplied = BigInt(totalShares) * BigInt(rNearExchangeRate) / BigInt(exchangeRateScale)

    sumSingleBalance(balances, "lst.rhealab.near", rNearSupplied)

    return balances
}

module.exports = {
    near: {
        tvl: tvl
    }
}