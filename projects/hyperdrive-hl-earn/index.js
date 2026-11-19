const { getConfig } = require("../helper/cache");

async function tvl(api) {
    const config = await getConfig('hyperdrive-vaults', 'https://api.hyperdrive.finance/v2/earn?chainId=999&types=hyperdrive-liquidator%2Chyperliquid-vault%2Chyperliquid-staking%2Covault')
    const vaults = Object.values(config.data).map(i => i.token)
    return api.erc4626Sum2({ calls: vaults, permitFailure: true });
}

module.exports = {
    hyperliquid: {
        tvl,
    },
    doublecounted: true,
    methodology: "Gets the assets deposited across all vaults.",
};
