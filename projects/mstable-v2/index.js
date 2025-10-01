const {CONFIG_DATA} = require("./config");
const {DHEDGE_FACTORY_ABI, MSTABLE_POOL_ABI} = require("./abis");


async function tvl(api) {
    const { chain, } = api
    const { dhedgeFactory, mstableManager } = CONFIG_DATA[chain];

    const pools = await api.call({
        abi: DHEDGE_FACTORY_ABI,
        target: dhedgeFactory,
        params: [mstableManager],
    });

    const poolSummariesRes = await api.multiCall({
        abi: MSTABLE_POOL_ABI,
        calls: pools,
        permitFailure: true
    });

    const poolSummaries = poolSummariesRes.filter(i => i && i.totalFundValue !== null && i.totalFundValue !== undefined);

    const totalValue = poolSummaries.reduce(
        (acc, i) => acc + +i.totalFundValue,
        0
    );

    return {
        tether: totalValue / 1e18,
    };
}

module.exports = {
    misrepresentedTokens: true,
    start: '2025-08-12', // Friday, August 8, 2025 12:00:00 AM
    methodology:
        "Aggregates total value of each mStable vaults on Ethereum",
    ethereum: {
        tvl,
    },

};
