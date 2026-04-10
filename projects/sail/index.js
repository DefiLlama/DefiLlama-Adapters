const { getConfig } = require('../helper/cache');
const { yieldSourcesAddresses: baseTokens } = require('./base');
const { yieldSourcesAddresses: arbitrumTokens } = require('./arbitrum');

async function getOwners() {
    const data = await getConfig('sail/active-wallets', 'https://app.sail.money/api/v1/projects/sail/pages/institutions/custom/active_wallets');
    const owners = Array.isArray(data) ? data : data.result;
    return owners.filter(o => o !== '');
}

async function baseTvl(api) {
    const owners = await getOwners();
    return api.sumTokens({ tokens: baseTokens, owners });
}

async function arbitrumTvl(api) {
    const owners = await getOwners();
    return api.sumTokens({ tokens: arbitrumTokens, owners });
}

module.exports = {
    methodology: 'TVL is calculated by querying onchain balances of Sail smart wallet accounts across DeFi protocols/vaults on each supported chain.',
    base: { tvl: baseTvl },
    arbitrum: { tvl: arbitrumTvl },
};
