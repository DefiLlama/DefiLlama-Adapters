const { getConfig } = require('../helper/cache');
const { allPoolTokens: basePoolTokens } = require('./base');
const { allPoolTokens: arbitrumPoolTokens } = require('./arbitrum');

async function baseTvl(api) {
    const owners = ["0x5F01488eD803b3f48BbF4020504344711787bfAE"]; //await getConfig('sail/' + api.chain, 'https://api.sail.xyz/api/v1/data/smart-accounts?chainId=8453');
    return api.sumTokens({
        tokens: basePoolTokens,
        owners: owners.filter(o => o !== ''),
    });
}

async function arbitrumTvl(api) {
    const owners = ["0x5F01488eD803b3f48BbF4020504344711787bfAE"]; //await getConfig('sail/' + api.chain, 'https://api.sail.xyz/api/v1/data/smart-accounts?chainId=42161');
    return api.sumTokens({
        tokens: arbitrumPoolTokens,
        owners: owners.filter(o => o !== ''),
    });
}

module.exports = {
    methodology: 'TVL is calculated by querying onchain balances of Sail smart wallet accounts across DeFi protocols on each supported chain.',
    base: { tvl: baseTvl },
    arbitrum: { tvl: arbitrumTvl },
};
