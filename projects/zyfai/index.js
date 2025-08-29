const { beetsTvl, penpieTvl, sonicTokens } = require('./helpers');
const {
    allPoolTokens
} = require('./base');
const { getConfig } = require('../helper/cache');

async function sonicTvl(api) {
    // For Sonic chain
    const owners = await getConfig('zyfai/'+api.chain, 'https://api.zyf.ai/api/v1/data/active-wallets?chainId=146');
    await Promise.all([
        beetsTvl(api, owners),
        penpieTvl(api, owners),
    ]);
    return api.sumTokens({ owners, tokens: sonicTokens })
}

async function baseTvl(api) {
    // For Base chain
    const owners = await getConfig('zyfai/'+api.chain, 'https://api.zyf.ai/api/v1/data/active-wallets?chainId=8453');

    return api.sumTokens({
        tokens: allPoolTokens,
        owners
    });
}

module.exports = {
    methodology: 'Counts the TVL of all smart wallet accounts deployed by ZyFAI protocol across multiple DeFi protocols',
    sonic: { tvl: sonicTvl },
    base: { tvl: baseTvl }
}