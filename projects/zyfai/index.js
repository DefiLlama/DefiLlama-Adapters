const { siloTvl, aaveTvl, eulerTvl, pendleTvl, beetsTvl, penpieTvl, yieldfiTvl } = require('./helpers');
const { aaveTvl: aaveTvlBase, fluidTvl, morphoTvl, sparkTvl } = require('./base');
const { get } = require('../helper/http');

async function sonicTvl(api) {
    // For Sonic chain
    const owners = await get('https://api.zyf.ai/api/v1/data/active-wallets?chainId=146');
    await Promise.all([
        siloTvl(api, owners),
        aaveTvl(api, owners),
        pendleTvl(api, owners),
        eulerTvl(api, owners),
        beetsTvl(api, owners),
        penpieTvl(api, owners),
        yieldfiTvl(api, owners)
    ]);
}

async function baseTvl(api) {
    // For Base chain
    const owners = await get('https://api.zyf.ai/api/v1/data/active-wallets?chainId=8453');
    await Promise.all([ 
        aaveTvlBase(api, owners),
        fluidTvl(api, owners),
        morphoTvl(api, owners),
        sparkTvl(api, owners)
    ]);
}

module.exports = {
    methodology: 'Counts the TVL of all smart wallet accounts deployed by ZyFAI protocol across multiple DeFi protocols',
    sonic: { tvl: sonicTvl },
    base: { tvl: baseTvl }
}