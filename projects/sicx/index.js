const axios = require("axios");
const BigNumber = require("bignumber.js");

const icxApiEndpoint = 'https://ctz.solidwallet.io/api/v3'
const bandOracleContract = 'cx087b4164a87fdfb7b714f3bafe9dfb050fd6b132'
const stakingContract = "cx43e2eec79eb76293c298f2b17aec06097be606e0"


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
    let response = await icxCall(bandOracleContract, 'get_ref_data', {'_symbol': 'ICX'})
    let icxUsdPrice = sicxIcxPrice = parseInt(response.rate, 16) / 10 ** 9;
    return icxUsdPrice
}

async function getTotalClaimableIcx() {
    let response = await icxCall(stakingContract, 'totalClaimableIcx')
    let totalClaimableIcx = parseInt(response, 16) / 10 ** 18;
    return totalClaimableIcx
}

async function fetch() {
    let totalClaimableIcx = await getTotalClaimableIcx()
    let icxUsdPrice = await getIcxUsdPrice()
    let tvl = new BigNumber(totalClaimableIcx * icxUsdPrice).toFixed(2);
    return tvl
}

module.exports = {
    fetch,
}