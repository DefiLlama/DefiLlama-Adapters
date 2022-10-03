const axios = require('axios')

async function tvl(){
    const tvl = await axios.get('https://spec-api.azurefd.net/api/data?type=tvl')
    return {
        'terrausd': tvl.data.tvl,
    }
}

module.exports = {
    timetravel: false,
    terra2:{
        tvl
    },
    hallmarks:[
    [1651881600, "UST depeg"],
  ]
}  

//add the new chain terra2
