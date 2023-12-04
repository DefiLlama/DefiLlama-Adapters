const { get } = require('../helper/http')

module.exports = {
    misrepresentedTokens: false,
    timetravel: false,
    methodology: 'Total amount of jUSDT locked in the StormTrade vault (EQDynReiCeK8xlKRbYArpp4jyzZuF6-tYfhFM0O5ulOs5H0L)',
    ton: {
        tvl: async () => {
            const info = await get('https://api.redoubt.online/dapps/v1/export/defi/storm')
            return { 'usd': info['tvl'] }
        }
    }
}
