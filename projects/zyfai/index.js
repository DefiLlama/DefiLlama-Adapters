const { siloTvl, aaveTvl, eulerTvl, pendleTvl, beetsTvl, penpieTvl } = require('./helpers');
const { aaveTvl: aaveTvlBase, fluidTvl, morphoTvl, sparkTvl } = require('./base');

async function tvl(api) {
    const { get } = require('../helper/http');

    // For Sonic chain
    const owners = await get('https://api.zyf.ai/api/v1/data/active-wallets?chainId=146');
    await Promise.all([
        siloTvl(api, owners),
        aaveTvl(api, owners),
        pendleTvl(api, owners),
        eulerTvl(api, owners),
        beetsTvl(api, owners),
        penpieTvl(api, owners)
    ]);

    // For Base chain
    const baseOwners = [
        '0xb50685c25485CA8C520F5286Bbbf1d3F216D6989', 
        '0x952835d17AC55825F198a68DAb2823cD60C8e6bd'
    ]; // we will change later dynamic owners, i.e. owners api
    await Promise.all([ 
        aaveTvlBase(api, baseOwners),
        fluidTvl(api, baseOwners),
        morphoTvl(api, baseOwners),
        sparkTvl(api, baseOwners)
    ]);

}

module.exports = {
    methodology: 'Counts the TVL of all smart wallet accounts deployed by ZyFAI protocol across multiple DeFi protocols',
    sonic: { tvl }
}