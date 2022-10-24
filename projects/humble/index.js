const axios = require('axios');
const retry = require('../helper/retry');
const { toUSDTBalances } = require('../helper/balances');

async function tvl(){
    const response = (
        await retry(
            async () => await axios.get(
                'https://free-api.vestige.fi/providers?currency=USD'
            )
        )
    )

    const data = response.data.find(p => p.id === 'H2')

    return toUSDTBalances(data.tvl);
}

module.exports={
    timetravel: false,
    misrepresentedTokens:true,
    algorand:{
        tvl
    }
}
