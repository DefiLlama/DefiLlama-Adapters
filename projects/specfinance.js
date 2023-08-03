const axios = require('axios')

async function tvl(){
    const tvl = await axios.get('https://spec-api-eeh8efcmd2b0fffh.z01.azurefd.net/api/data?type=lpVault')
    return {
        'terrausd': tvl.data.stat.tvl / 1e6,
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
        tvl: () => ({}),
    },
    terra2:{
        tvl: terra2
    },
    hallmarks:[
    [1651881600, "UST depeg"],
  ]
}
