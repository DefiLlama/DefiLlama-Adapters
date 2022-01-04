const axios = require("axios");
const BigNumber = require("bignumber.js");

const icxApiEndpoint = 'https://ctz.solidwallet.io/api/v3'

const ommLendingPoolDataProviderContract = 'cx5f9a6ca11b2b761a469965cedab40ada9e503cb5'

async function toInt(s) {
    result = parseInt(s, 16)
    return result
}

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

async function calculateOmmTvl() {
    let totalSuppliedValue = 0
    let totalBorrowedValue = 0
    
    let totalSuppliedArray = new Array();
    let totalBorrowedArray = new Array();

    let data = await icxCall(ommLendingPoolDataProviderContract, 'getAllReserveData', {})

    // Loop through result of call to getAllReserveData, and push totalLiquidityUSD and totalBorrowsUSD for all assets to arrays.

    for (const [key, value] of Object.entries(data)) {
        totalSuppliedArray.push(await toInt(value['totalLiquidityUSD']))
        totalBorrowedArray.push(await toInt(value['totalBorrowsUSD']))
    }

    // Loop through arrays, and sum them.

    for (let i = 0; i < totalSuppliedArray.length; i++) {
        totalSuppliedValue += totalSuppliedArray[i];
    }

    for (let i = 0; i < totalBorrowedArray.length; i++) {
        totalBorrowedValue += totalBorrowedArray[i];
    }

    // Calculate Omm TVL by subtracting total borrowed value from total supplied value and.
    let tvl = (totalSuppliedValue - totalBorrowedValue) / 10 ** 18

    return new BigNumber(tvl).toFixed(2)
}

async function fetch() {
    let ommTvl = await calculateOmmTvl()
    return ommTvl
}

module.exports = {
   fetch
}