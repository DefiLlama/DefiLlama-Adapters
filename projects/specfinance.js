const axios = require('axios')

async function tvl(){
    const tvl = await axios.get('https://api.spec.finance/api/stat')
    return {
        'terrausd': tvl.data.tvl,
    }
}

async function terra2(){
    const tvl = await axios.get('https://spec-api.azurefd.net/api/data?type=tvl')
    return {
        'tether': tvl.data.tvl,
    }
}

module.exports = {
    misrepresentedTokens: true,
    timetravel: false,
    terra:{
        tvl
    },
    terra2:{
        tvl: terra2
    },
    hallmarks:[
    [1651881600, "UST depeg"],
  ]
}
