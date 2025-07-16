const { siloTvl, aaveTvl, eulerTvl, pendleTvl, beetsTvl, penpieTvl } = require('./helpers');

async function tvl(api) {
    const { get } = require('../helper/http');
    const owners = await get('https://api.zyf.ai/api/v1/data/active-wallets?chainId=146');
    await Promise.all([
        siloTvl(api, owners),
        aaveTvl(api, owners),
        pendleTvl(api, owners),
        eulerTvl(api, owners),
        beetsTvl(api, owners),
        penpieTvl(api, owners)
    ]);
}

module.exports = {
    methodology: 'Counts the TVL of all smart wallet accounts deployed by ZyFAI protocol across multiple DeFi protocols',
    sonic: { tvl }
}