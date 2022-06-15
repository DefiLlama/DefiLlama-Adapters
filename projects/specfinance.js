const axios = require('axios')

async function tvl(){
    const tvl = await axios.get('https://api.spec.finance/api/stat')
    return {
        'terrausd': tvl.data.tvl,
    }
}

module.exports = {
    timetravel: false,
    terra:{
        tvl
    },
}
