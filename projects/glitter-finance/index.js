
//Solana Helpers
const {
    sumTokens2,
} = require("../helper/solana");

//Algorand Helpers
const axios = require('axios')
const axiosObj = axios.create({
    baseURL: 'https://algoindexer.algoexplorerapi.io',
    timeout: 300000,
})

//addresses
const SOLANA_VAULT = "7xCU4nvqu3Nz3BBQckKzibp3kBav4xbkuqQ3WM9CBHdJ";
const ALGO_VAULT = "R7VCOR74LCUIFH5WKCCMZOS7ADLSDBQJ42YURFPDT3VGYTVNBNG7AIYTCQ";

//TVL Calculations:
async function solana_tvl() {
    return sumTokens2({ solOwners: [SOLANA_VAULT]})
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
    hallmarks: [
        [1661337600, "SPL Vault Migration (V2 Expansion)"],
    ],
    timetravel: false,
    methodology:
        "TVL counts tokens and native assets locked in Glitter-Finance bridge vaults. CoinGecko is used to find the price of tokens in USD.",
    solana: { tvl: solana_tvl },
    algorand: { tvl: algorand_tvl},
};