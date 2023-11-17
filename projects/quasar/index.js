const sdk = require("@defillama/sdk")
const {getConfig} = require('../helper/cache')

async function tvl() {
    const data = await getConfig('quasar-vaults', 'https://api.quasar.fi/vaults')
    const vaults = data.filter(i => i.chainId === 'osmosis-1').map(i => i.address)
    let balances = {}
    for (const vault of vaults) {
        let tvl_api = "https://api.quasar.fi/vaults/" + vault + "/tvl?time_resolution=day"
        let tvl_data = await getConfig('quasar-vaults-tvl' + vault, tvl_api)
        let usdAmounts = tvl_data.map(entry => entry.tvl.usd);
        if (usdAmounts.length > 0) {
            sdk.util.sumSingleBalance(
                balances,
                "usd",
                usdAmounts[0],
            )
        }
    }
    return balances
}

module.exports = {
    timetravel: false,
    methodology: 'Total TVL on vaults',
    osmosis: {
        tvl,
    },
}
