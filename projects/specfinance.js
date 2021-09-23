const axios = require('axios')

async function fetch(){
    const tvl = await axios.get('https://api.spec.finance/api/stat')
    return tvl.data.tvl
}

module.exports = {
    terra:{
        fetch
    },
    fetch
}