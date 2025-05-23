const { siloTvl, aaveTvl, eulerTvl, pendleTvl, beetsTvl, penpieTvl } = require('./helpers');

async function tvl(api) {
    const { get } = require('../helper/http');

    // Fetch active wallet addresses from ZyFAI API
    const owners = await get('https://api.zyf.ai/api/v1/data/active-wallets?chainId=146');

    // Calculate TVL across different protocols
    const [
        siloUsd,
        aaveUsd,
        pendleUsd,
        eulerUsd,
        beetsUsd,
        penpieUsd
    ] = await Promise.all([
        siloTvl(api, owners),
        aaveTvl(api, owners),
        pendleTvl(api, owners),
        eulerTvl(api, owners),
        beetsTvl(api, owners),
        penpieTvl(api, owners)
    ]);

    // Sum up total TVL across all protocols
    const totalTvl = siloUsd + aaveUsd + pendleUsd + eulerUsd + beetsUsd + penpieUsd;

    return { usd: totalTvl };
}

module.exports = {
    methodology: 'Counts the TVL of all smart wallet accounts deployed by ZyFAI protocol across multiple DeFi protocols',
    sonic: {
        tvl,
    }
}