const axios = require("axios")

const icxApiEndpoint = 'https://ctz.solidwallet.io/api/v3'
const stakingContract = "cx43e2eec79eb76293c298f2b17aec06097be606e0"
const sIcxTokenContract = "cx2609b924e33ef00b648a409245c7ea394c467824"
const bandOracleContract = 'cx087b4164a87fdfb7b714f3bafe9dfb050fd6b132'

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

async function getIcxUsdPrice() {
    let response = await icxCall(bandOracleContract, 'get_ref_data', { '_symbol': 'ICX' })
    let icxUsdPrice = sicxIcxPrice = parseInt(response.rate, 16) / 10 ** 9;
    return icxUsdPrice
}

async function getTotalClaimableIcx() {
    let response = await icxCall(stakingContract, 'totalClaimableIcx')
    return parseInt(response, 16) / 10 ** 18
}

async function getTotalSupply() {
    let response = await icxCall(sIcxTokenContract, 'totalSupply')
    return parseInt(response, 16) / 10 ** 18
}

async function getTodayRate() {
    let response = await icxCall(stakingContract, 'getTodayRate')
    return parseInt(response, 16) / 10 ** 18
}

async function fetch() {

    let icxPrice = await getIcxUsdPrice();
    let totalClaimableIcx = await getTotalClaimableIcx();
    let totalSupply = await getTotalSupply();
    let todayRate = await getTodayRate();
    // tvl = ICX/USD Price * (totalClaimableIcx + totalSupply from sICX token SCORE * getTodayRate)
    const tvl = icxPrice * (totalClaimableIcx + totalSupply * todayRate);
    return { 'icon': tvl }
}

module.exports = {
    timetravel: false,
    icon: { tvl: fetch },
}