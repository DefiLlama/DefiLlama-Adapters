const { getTokenAccountBalance } = require("../helper/solana");
const retry = require("../helper/retry");
const { toUSDTBalances } = require('../helper/balances');
const axios = require("axios");
async function tvl() {
    let url = "https://lambda.optifi.app/get_tvl?optifi_program_id="
    let optifi_program_id = "optFiKjQpoQ3PvacwnFWaPUAqXCETMJSz2sz8HwPe9B"

    const response = (
        await retry(async () => await axios.get(url + optifi_program_id))
    ).data;
    let data = Object.values(response)
    let userMarginAccountUsdcPubkey = []
    userMarginAccountUsdcPubkey = data[0].userMarginAccountUsdcPubkey
    let quoteTokenVault = []
    quoteTokenVault = data[0].quoteTokenVault
    let pcVault = []
    pcVault = data[0].pcVault

    let totalTvl = 0;

    //1. user usdc balance in options dex margin account 
    let usersMarginAccountUsdcBalance = 0;
    for (let e of userMarginAccountUsdcPubkey) {
        let balance = await getTokenAccountBalance(e)
        usersMarginAccountUsdcBalance += balance
    }
    // console.log("usersMarginAccountUsdcBalance: " + usersMarginAccountUsdcBalance)

    //2. user amm usdc balance
    let userAmmUsdcBalance = 0;
    for (let e of quoteTokenVault) {
        let balance = await getTokenAccountBalance(e)
        userAmmUsdcBalance += balance
    }
    // console.log("userAmmUsdcBalance: " + userAmmUsdcBalance)

    //3.OptiFi serum market pcVault
    let serumMarketPcVaultBalance = 0;
    for (let e of pcVault) {
        let balance = await getTokenAccountBalance(e)
        serumMarketPcVaultBalance += balance
    }
    // console.log("serumMarketPcVaultBalance: " + serumMarketPcVaultBalance)

    //totalTvl
    totalTvl = usersMarginAccountUsdcBalance + userAmmUsdcBalance + serumMarketPcVaultBalance

    return toUSDTBalances(totalTvl)
}

module.exports = {
    timetravel: false,
    methodology: "OptiFi uses the total of amm usdc balance, user usdc balance in the options margin account, and serum market pcVault to calculate TVL. The data doesn’t include Mango positions so there’s a difference from what is displayed on our app.",
    solana: {
        tvl: tvl,
    }
}
