const CONFIG_DATA = {
    ethereum: {
        dhedgeFactory: "0x96d33bcf84dde326014248e2896f79bbb9c13d6d",
        mstableManager: "0x3dd46846eed8D147841AE162C8425c08BD8E1b41",
        aavePool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
        aavePoolDataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3',
    },
};
const DHEDGE_FACTORY_ABI =
    "function getManagedPools(address manager) view returns (address[] managedPools)";

const DHEDGE_POOL_LOGIC_ABI =
    "function poolManagerLogic() view returns (address)";

const MSTABLE_POOL_MANAGER_LOGIC_ABI =
    "function getFundComposition() view returns (tuple(address asset, bool isDeposit)[] assets, uint256[] balances)";

const AAVE_GET_RESERVE_DATA =
    "function getReserveData(address asset) view returns (((uint256 data) configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))";

const AAVE_GET_RESERVES_LIST = "address[]:getReservesList";

const AAVE_GET_USER_RESERVE_DATA =
    "function getUserReserveData(address asset, address user) view returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)";
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
