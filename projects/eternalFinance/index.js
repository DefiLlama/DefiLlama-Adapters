const { lyfTvl } = require("./lyf");
const { lendingTvl } = require("./lending");
const sdk = require('@defillama/sdk')

async function tvl() {
    const lyf = await lyfTvl();
    const lending = await lendingTvl();
    const balances = {}
    sdk.util.mergeBalances(balances, lyf)
    sdk.util.mergeBalances(balances, lending)
    return balances
}

module.exports = {
    timetravel: false,
    aptos: {
        tvl,
    }
}