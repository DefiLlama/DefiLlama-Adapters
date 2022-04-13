const axios = require('axios');
const retry = require('../helper/retry');
const { toUSDTBalances } = require('../helper/balances');

async function tvl(){
    const response = (
        await retry(
            async () => await axios.get(
                'https://yhnyufyj90.execute-api.us-east-1.amazonaws.com/prod/humble-tvl'
            )
        )
    )

    const data = response.data

    return data.tvl ? toUSDTBalances(data.tvl) : toUSDTBalances(0);
}

module.exports={
    algorand:{
        tvl
    }
}