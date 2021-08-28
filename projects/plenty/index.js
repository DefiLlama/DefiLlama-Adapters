const axios = require('axios')

async function fetch(){
    const tvl = await axios.get("https://w0sujgfj39.execute-api.us-east-2.amazonaws.com/v1/tvl")
    const staking = await axios.get("https://w0sujgfj39.execute-api.us-east-2.amazonaws.com/v1/stakedplenty")
    return tvl.data.body - staking.data.body
}

async function staking(){
    const staking = await axios.get("https://w0sujgfj39.execute-api.us-east-2.amazonaws.com/v1/stakedplenty")
    return staking.data.body
}

module.exports = {
    staking:{
        fetch: staking
    },
    fetch
}