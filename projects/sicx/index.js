const axios = require("axios")

const icxApiEndpoint = 'https://ctz.solidwallet.io/api/v3'
const stakingContract = "cx43e2eec79eb76293c298f2b17aec06097be606e0"
const sIcxTokenContract = "cx2609b924e33ef00b648a409245c7ea394c467824"

async function icxCall(address, method, params) {
    let response = await axios.post(icxApiEndpoint, {
        jsonrpc: '2.0',
        method: 'icx_call',
        id: 1234,
        params: {
            to: address,
            dataType: 'call',
            data: {
                method: method,
                params: params
            }
        }
    })
    return response.data.result
}

async function getTotalClaimableIcx() {
    let response = await icxCall(stakingContract, 'totalClaimableIcx')
    return parseInt(response, 16) / 10 ** 18
}

async function getTotalSupply() {
    let response = await icxCall(sIcxTokenContract, 'totalSupply')
    return parseInt(response, 16) / 10 ** 18
}

async function fetch() {

    let totalClaimableIcx = await getTotalClaimableIcx();
    let totalSupply = await getTotalSupply();
    // tvl = ICX/USD Price * (totalClaimableIcx + totalSupply from sICX token SCORE * getTodayRate)
    const tvl = totalClaimableIcx + totalSupply;
    return { 'icon': tvl }
}

module.exports = {
    timetravel: false,
    icon: { tvl: fetch },
}
