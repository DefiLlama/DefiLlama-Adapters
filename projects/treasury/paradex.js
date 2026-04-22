const { treasuryExports } = require("../helper/treasury");
const ADDRESSES = require('../helper/coreAssets.json')

//https://app.paradex.trade/dime/overview
const PARADEX_TREASURY = '0xF1f82188E7D3B54b8872986869D4207F8A78A4F1';
const DIME_TOKEN = "0xb32E10022FFBeDfE10bc818a1C7e67D9d87e0fa7";

module.exports = treasuryExports({
    ethereum: {
        owners: [PARADEX_TREASURY],
        tokens: [
            ADDRESSES.null,
            ADDRESSES.ethereum.USDC,
            DIME_TOKEN
        ],
        ownTokens: [DIME_TOKEN]
    }
})