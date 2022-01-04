const axios = require('axios')

const chainIds = {
    'ethereum': 1
}
async function getTokens(address, chain = "ethereum"){
    const allTokens = (await axios.get(`https://api.covalenthq.com/v1/${chainIds[chain]}/address/${address}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`)).data.data.items.filter(t=>t.contract_address !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
    return allTokens.map(token=>token.contract_address)
}

module.exports = {
    getTokens
}