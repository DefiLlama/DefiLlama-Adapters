const { sumTokens2 } = require("../helper/chain/cardano");
const lockedAssetsAddresses = ["addr1wxms0ke7yf5e525kruhpacgaprwscxrefd29q9mu5j6tcgqme9f96"]

async function tvl() {
    const lockedAssets = await sumTokens2({
        owners: lockedAssetsAddresses
    })
    return lockedAssets
}

module.exports = {
    timetravel: false,
    cardano: {
        tvl
    }
}
