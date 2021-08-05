const retry = require("async-retry");
const axios = require("axios");
const BigNumber = require("bignumber.js");

const icxApiEndpoint = 'https://ctz.solidwallet.io/api/v3'
const balancedDexContract = 'cxa0af3165c08318e988cb30993b3048335b94af6c'
const balancedLoansContract = 'cx66d4d90f5f113eba575bf793570135f9b10cece1'
const bandOracleContract = 'cx087b4164a87fdfb7b714f3bafe9dfb050fd6b132'
const bnusdContract = 'cx88fd7df7ddff82f7cc735c871dc519838cb235bb'
const sicxContract = 'cx2609b924e33ef00b648a409245c7ea394c467824'

async function icxCall(address, method, params) {
    try {
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
    catch(e) {
        console.log(e)
    }
}

async function getIcxUsdPrice() {
    let response = await icxCall(bandOracleContract, 'get_ref_data', {'_symbol': 'ICX'})
    let icxUsdPrice = sicxIcxPrice = parseInt(response.rate, 16) / 10 ** 9;
    return icxUsdPrice
}

async function getSicxIcxPrice() {
    let response = await icxCall(balancedDexContract, 'getPrice', {'_id': '1'})
    let sicxIcxPrice = parseInt(response, 16) / 10 ** 18;
    return sicxIcxPrice
}

async function getLoanTvl() {
    let icxUsdPrice = await getIcxUsdPrice()
    let sicxIcxPrice = await getSicxIcxPrice()
    let response = await icxCall(balancedLoansContract, 'getTotalCollateral') // Fetch total sICX collateral.
    let loanTvlSicx = parseInt(response, 16) / 10 ** 18;
    let loanTvlUsd = loanTvlSicx * icxUsdPrice * sicxIcxPrice
    return loanTvlUsd
}

async function getBnusdUsdPrice() {
    sicxUsdPrice = await getSicxUsdPrice()
    response = await icxCall(balancedDexContract, 'getSicxBnusdPrice')
    sicxBnusdPrice = parseInt(response, 16) / 10 ** 18
    bnusdSicxPrice = 1 / sicxBnusdPrice
    bnusdUsdPrice = bnusdSicxPrice * sicxUsdPrice
    return bnusdUsdPrice
}

async function getSicxUsdPrice() {
    let sicxIcxPrice = await getSicxIcxPrice()
    let icxUsdPrice = await getIcxUsdPrice()
    let sicxUsdPrice = sicxIcxPrice * icxUsdPrice
    return sicxUsdPrice
}

async function getDexTvl() {
    let icxUsdPrice = await getIcxUsdPrice()
    let sicxUsdPrice = await getSicxUsdPrice()
    let bnusdUsdPrice = await getBnusdUsdPrice()

    let sicxIcxPool = await icxCall(balancedDexContract, 'totalSupply', {'_id': '1'}); // Get sICX/ICX TVL in ICX.
    let sicxBnusdPool = await icxCall(balancedDexContract, 'getPoolTotal', {'_id': '2', '_token': bnusdContract}); // Get sICX/bnUSD TVL in bnUSD.
    let balnBnusdPool = await icxCall(balancedDexContract, 'getPoolTotal', {'_id': '3', '_token': bnusdContract}); // Get BALN/bnUSD TVL in bvnUSD.
    let balnSicxPool = await icxCall(balancedDexContract, 'getPoolTotal', {'_id': '4', '_token': sicxContract}); // Get BALN/sICX TVL in sICX.

    let sicxIcxTvlUsd = parseInt(sicxIcxPool, 16) * icxUsdPrice / 10 ** 18;
    let sicxBnusdTvlUsd = parseInt(sicxBnusdPool, 16) * 2 * bnusdUsdPrice / 10 ** 18; // Multiply by 2 to get USD value of entire pool.
    let balnBnusdTvlUsd = parseInt(balnBnusdPool, 16) * 2 * bnusdUsdPrice / 10 ** 18; // Multiply by 2 to get USD value of entire pool.
    let balnSicxTvlUsd = parseInt(balnSicxPool, 16) * 2 * sicxUsdPrice / 10 ** 18; // Multiply by 2 to get USD value of entire pool.
    
    let dexTvlUsd = sicxIcxTvlUsd + sicxBnusdTvlUsd + balnBnusdTvlUsd + balnSicxTvlUsd
    
    return dexTvlUsd;
}

async function fetch() {
    let loanTvl = await getLoanTvl()
    let dexTvl = await getDexTvl()
    let tvl = new BigNumber(loanTvl + dexTvl).toFixed(2);
    return tvl
}

module.exports = {
   fetch
}