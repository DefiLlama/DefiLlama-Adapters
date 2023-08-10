const ADDRESSES = require('../helper/coreAssets.json')
//Solana Helpers
const { sumTokensExport, } = require("../helper/sumTokens")
const { getTokenBalance,sumTokens } = require("../helper/solana");
//addresses
const SOLANA_VAULT = "7xCU4nvqu3Nz3BBQckKzibp3kBav4xbkuqQ3WM9CBHdJ";
const XSOL_ADDRESS = "xALGoH1zUfRmpCriy94qbfoMXHtK6NDnMKzT4Xdvgms";
const ALGO_VAULT = "R7VCOR74LCUIFH5WKCCMZOS7ADLSDBQJ42YURFPDT3VGYTVNBNG7AIYTCQ";

async function solanaTVL(){
    const tokensAndOwners = []
    tokensAndOwners.push([ADDRESSES.SOLANA, SOLANA_VAULT])
    return sumTokens(tokensAndOwners);

}

module.exports = {
    hallmarks: [
        [1661337600, "SPL Vault Migration (V2 Expansion)"],
    ],
    timetravel: false,
    methodology:
        "TVL counts tokens and native assets locked in Glitter-Finance bridge vaults. CoinGecko is used to find the price of tokens in USD.",
    solana: { tvl: solanaTVL },
    algorand: { tvl: sumTokensExport({ owners: [ALGO_VAULT] }) },
};