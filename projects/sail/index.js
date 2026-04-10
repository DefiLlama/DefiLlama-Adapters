const { getConfig } = require('../helper/cache');
const { allPoolTokens: basePoolTokens } = require('./base');
const { allPoolTokens: arbitrumPoolTokens } = require('./arbitrum');

async function getOwners() {
    const data = await getConfig('sail/active-wallets', 'https://app.sail.money/api/v1/projects/sail/pages/institutions/custom/active_wallets');
    const owners = Array.isArray(data) ? data : data.result;
    return owners.filter(o => o !== '');
}

async function baseTvl(api) {
    const owners = await getOwners();
    return api.sumTokens({ tokens: basePoolTokens, owners });
}

async function arbitrumTvl(api) {
    const owners = await getOwners();
    return api.sumTokens({ tokens: arbitrumPoolTokens, owners });
}

module.exports = {
    methodology: 'TVL is calculated by querying onchain balances of Sail smart wallet accounts across DeFi protocols on each supported chain.',
    base: { tvl: baseTvl },
    arbitrum: { tvl: arbitrumTvl },
};
