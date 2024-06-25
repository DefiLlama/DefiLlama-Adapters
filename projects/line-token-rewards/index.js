/**
 * Get a share of Kava Rise rewards by simply holding tokens imported from Kava in your Obyte wallet.
 * Kava Rise program rewards us for the TVL that our dapps Counterstake and LINE create on the Kava network. 
 * We share 50% of these rewards with you if you actually contribute to this TVL and hold the tokens imported through Counterstake bridge in your Obyte wallet.
 * 
 * @see https://kava.obyte.org
 */

const utils = require("../helper/utils");
const BACKEND_API_URL = "https://kava.obyte.org/api";

const tvl = async () => {
    const avgBalances = await utils.fetchURL(`${BACKEND_API_URL}/average_balances/latest`).then(data => data.data.data);

    const tvl = avgBalances.reduce((currentValue, { effective_usd_balance = 0, home_symbol }) => {
        return currentValue + (effective_usd_balance / (home_symbol === "LINE" ? 2 : 1));
    }, 0);

    return ({ tether: tvl });
};

module.exports = {
    methodology: 'The TVL is calculated as USD value of all the assets transferred from Kava to Obyte and eligible for rewards.',
    obyte: {
        tvl
    }
}