
//Solana Helpers
const {
    getSolBalance,
} = require("../helper/solana");

//Algorand Helpers
const axios = require('axios')
const axiosObj = axios.create({
    baseURL: 'https://algoindexer.algoexplorerapi.io',
    timeout: 300000,
})

//addresses
const SOLANA_VAULT = "92xRN79NA9p9D4Wg49Lr73yE6eypbmJwB1AESYfbD5xA";
const ALGO_VAULT = "R7VCOR74LCUIFH5WKCCMZOS7ADLSDBQJ42YURFPDT3VGYTVNBNG7AIYTCQ";

//TVL Calculations:
async function solana_tvl() {

    const tvlResult = {};

    //Get sol balance from the SOL vault
    const amount_sol = await getSolBalance(SOLANA_VAULT);

    //Set solana return balance
    if (!tvlResult["solana"]) {
        tvlResult["solana"] = Number(amount_sol);
    } else {
        tvlResult["solana"] += Number(amount_sol);
    }

    return tvlResult;
}
async function algorand_tvl() {

    const tvlResult = {};
   
    //Get algo balance from Algo Vault
    const algo_account = await getAlgoBalance(ALGO_VAULT);
    var amount_algo = 0;

    //Ensure that the response is valid & set amount
    if (algo_account && algo_account.account && algo_account.account.amount) {
        amount_algo = algo_account.account.amount / 1000000; //Amount returned in microAlgos
    }

    if (!tvlResult["algorand"]) {
        tvlResult["algorand"] = Number(amount_algo);
    } else {
        tvlResult["algorand"] += Number(amount_algo);
    }

    return tvlResult;
}

async function getAlgoBalance(address) {
    const response = (await axiosObj.get(`/v2/accounts/${address}`))
    return response.data
}

module.exports = {
    methodology:
        "TVL counts tokens and native assets locked in Glitter-Finance bridge vaults. CoinGecko is used to find the price of tokens in USD.",
    solana: { tvl: solana_tvl },
    algorand: { tvl: algorand_tvl},
};