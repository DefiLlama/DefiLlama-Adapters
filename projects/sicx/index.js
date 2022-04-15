const axios = require("axios")

const icxApiEndpoint = 'https://ctz.solidwallet.io/api/v3'
const stakingContract = "cx43e2eec79eb76293c298f2b17aec06097be606e0"

async function getBalance(address) {
    let response = await axios.post(icxApiEndpoint, {
        jsonrpc: '2.0',
        method: 'icx_getBalance',
        id: 1234,
        params: {
            address,
        }
    })
    return response.data.result
}

async function getTotalClaimableIcx() {
    let response = await getBalance(stakingContract)
    return parseInt(response, 16) / 10 ** 18
}

async function fetch() {
    let totalClaimableIcx = await getTotalClaimableIcx()
    return { 'icon': totalClaimableIcx }
}

module.exports = {
    timetravel: false,
    icon: { tvl: fetch },
}