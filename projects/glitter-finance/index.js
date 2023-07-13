const ADDRESSES = require('../helper/coreAssets.json')
//Solana Helpers
const { sumTokensExport, } = require("../helper/sumTokens")
//addresses
const SOLANA_VAULT = "7xCU4nvqu3Nz3BBQckKzibp3kBav4xbkuqQ3WM9CBHdJ";
const ALGO_VAULT = "R7VCOR74LCUIFH5WKCCMZOS7ADLSDBQJ42YURFPDT3VGYTVNBNG7AIYTCQ";

module.exports = {
    hallmarks: [
        [1661337600, "SPL Vault Migration (V2 Expansion)"],
    ],
    timetravel: false,
    methodology:
        "TVL counts tokens and native assets locked in Glitter-Finance bridge vaults. CoinGecko is used to find the price of tokens in USD.",
    solana: { tvl: sumTokensExport({ solOwners: [SOLANA_VAULT], }) },
    algorand: { tvl: sumTokensExport({ owners: [ALGO_VAULT] }) },
};