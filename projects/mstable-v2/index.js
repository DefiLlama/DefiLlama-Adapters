const {CONFIG_DATA} = require("./config");
const {
    DHEDGE_FACTORY_ABI,
    DHEDGE_POOL_LOGIC_ABI,
    MSTABLE_POOL_MANAGER_LOGIC_ABI,
    AAVE_GET_RESERVES_LIST,
    AAVE_GET_RESERVE_DATA,
    AAVE_GET_USER_RESERVE_DATA
} = require("./abis");
const {sumTokens2} = require("../helper/unwrapLPs");


async function getLockedAssetsForFunds(api) {
    const { chain, } = api
    const { dhedgeFactory, mstableManager, aavePool, aavePoolDataProvider } = CONFIG_DATA[chain];

    const pools = await api.call({
        abi: DHEDGE_FACTORY_ABI,
        target: dhedgeFactory,
        params: [mstableManager],
    });

    await processAaveTvl(pools, api, aavePool, aavePoolDataProvider);

    const poolManagerLogicAddresses = await api.multiCall({
        abi: DHEDGE_POOL_LOGIC_ABI,
        calls: pools,
        permitFailure: true
    });

    const fundCompositions = await api.multiCall({
        abi: MSTABLE_POOL_MANAGER_LOGIC_ABI,
        calls: poolManagerLogicAddresses,
        permitFailure: true
    });

    return fundCompositions.map(composition => {
        if (composition && composition.assets) {
            return composition.assets.reduce(
                (lockedTokens, [address], i) => ({...lockedTokens, [address]: composition.balances[i]}),
                {},
            )
        }
    })
}

async function processAaveTvl(aaveVaults, api, AAVE_POOL, AAVE_POOL_DATA_PROVIDER) {
    if (aaveVaults.length === 0 || !AAVE_POOL || !AAVE_POOL_DATA_PROVIDER) return

    const aaveReservesList = await api.call({ abi: AAVE_GET_RESERVES_LIST, target: AAVE_POOL });

    const aaveReserveDetails = await api.multiCall({ abi: AAVE_GET_RESERVE_DATA, target: AAVE_POOL, calls: aaveReservesList });

    const aaveQueryParams = [];
    aaveReservesList.forEach(asset => aaveVaults.forEach(vault => aaveQueryParams.push({ params: [asset, vault], })));
    const aavePositions = await api.multiCall({ abi: AAVE_GET_USER_RESERVE_DATA, target: AAVE_POOL_DATA_PROVIDER, calls: aaveQueryParams });

    for (const i in aavePositions) {
        const aavePosition = aavePositions[i];
        const reserveIdx = aaveReservesList.findIndex(x => x === aaveQueryParams[i].params[0]);

        api.addToken(aaveReserveDetails[reserveIdx].aTokenAddress, aavePosition.currentATokenBalance);
        api.addToken(aaveReserveDetails[reserveIdx].stableDebtTokenAddress, aavePosition.currentStableDebt);
        api.addToken(aaveReserveDetails[reserveIdx].variableDebtTokenAddress, aavePosition.currentVariableDebt);
    }

}


async function tvlForChain(api) {
    const { chain, } = api
    const isEthereum = chain === 'ethereum';

    const assetBalances = await getLockedAssetsForFunds(api);
    assetBalances
        .forEach((locked) => Object.entries(locked)
            .map(([underlying, balance]) => (
                [isEthereum ? underlying : `${chain}:${underlying}`, balance]
            ))
            .forEach(([address, balance]) =>
                api.addToken(address, balance)
            )
        );

    return sumTokens2({ api });

}

module.exports = {
    misrepresentedTokens: true,
    start: '2025-08-12', // Friday, August 8, 2025 12:00:00 AM
    methodology:
        "Aggregates total value of each mStable vaults on Ethereum",
    ethereum: {
        tvl: tvlForChain,
    },

};
