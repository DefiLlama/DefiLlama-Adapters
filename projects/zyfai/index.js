const { siloTvl, aaveTvl, eulerTvl, pendleTvl, beetsTvl, penpieTvl } = require('./helpers');

async function tvl(api) {
    const { get } = require('../helper/http');
    const owners = await get('https://api.zyf.ai/api/v1/data/active-wallets?chainId=146');
    // const owners = [
    //     '0x952835d17AC55825F198a68DAb2823cD60C8e6bd',
    //     '0xb50685c25485CA8C520F5286Bbbf1d3F216D6989',
    //     '0xd61C43c089852e0AB68B967dD1eDe03a18e52223'
    // ]
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