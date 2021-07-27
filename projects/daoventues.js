const {fetchURL} = require('./helper/utils')

async function fetch(){
    const result = await fetchURL('https://app.daoventures.co/api/vaults/tvl/total')
    return Number(result.data.body[0].tvl)
}

module.exports = {
    ethereum:{
        fetch
    },
    fetch
}