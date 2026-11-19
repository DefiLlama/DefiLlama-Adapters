const CONFIG_DATA = {
    ethereum: {
        dhedgeFactory: "0x96d33bcf84dde326014248e2896f79bbb9c13d6d",
        mstableManager: "0x3dd46846eed8D147841AE162C8425c08BD8E1b41",
        includedVaults: ["0xfec2adfa296fe189f53089fd5ccd8c28dd559cf2"],
        aavePool: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
        aavePoolDataProvider: "0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3",
        dytmOffice: "0x0ff1ceB93DbADfB13722058D60c4B8cD122b06ea",
        midasRedemptionVaults: ["0x5aeA6D35ED7B3B7aE78694B7da2Ee880756Af5C0"],
    },
};
const DHEDGE_FACTORY_ABI =
    "function getManagedPools(address manager) view returns (address[] managedPools)";

const DHEDGE_POOL_LOGIC_ABI =
    "function poolManagerLogic() view returns (address)";

const MSTABLE_POOL_MANAGER_LOGIC_ABI =
    "function getFundComposition() view returns (tuple(address asset, bool isDeposit)[] assets, uint256[] balances)";

const AAVE_GET_RESERVES_LIST = "address[]:getReservesList";

const AAVE_GET_USER_RESERVE_DATA =
    "function getUserReserveData(address asset, address user) view returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)";

const DHEDGE_GET_CONTRACT_GUARD =
    "function getContractGuard(address extContract) view returns (address)";

const DYTM_GET_OWNED_MARKET_IDS =
    "function getOwnedTokenIds(address pool) view returns (uint256[])";

const DYTM_GET_PERIPHERY = "address:dytmPeriphery";

const DYTM_GET_ACCOUNT_POSITION =
    "function getAccountPosition(uint256 account, uint88 market) view returns (tuple(tuple(uint256 debtShares, uint256 debtAssets, uint256 debtValueUSD, uint248 debtKey, address debtAsset) debt, tuple(uint256 tokenId, uint256 shares, uint256 assets, uint256 valueUSD, uint256 weightedValueUSD, uint64 weight, uint248 key, address asset, uint8 tokenType)[] collaterals, uint256 totalCollateralValueUSD, uint256 totalWeightedCollateralValueUSD, uint256 healthFactor, bool isHealthy) position)";

const MIDAS_GET_M_TOKEN = "address:mToken";
const {sumTokens2} = require("../helper/unwrapLPs");


async function getLockedAssetsForFunds(api) {
    const { chain, } = api
    const {
        dhedgeFactory,
        mstableManager,
        includedVaults,
        aavePool,
        aavePoolDataProvider,
        dytmOffice,
        midasRedemptionVaults,
    } = CONFIG_DATA[chain];

    const managedPools = await api.call({
        abi: DHEDGE_FACTORY_ABI,
        target: dhedgeFactory,
        params: [mstableManager],
    });
    const includedVaultSet = new Set(includedVaults.map(vault => vault.toLowerCase()));
    const pools = managedPools.filter(vault => includedVaultSet.has(vault.toLowerCase()));

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

    await Promise.all([
        processAaveTvl(pools, api, aavePool, aavePoolDataProvider),
        processDytmTvl(pools, fundCompositions, api, dhedgeFactory, dytmOffice),
        processMidasPendingRedemptions(fundCompositions, api, midasRedemptionVaults),
    ]);

    const nonTokenAssets = new Set(
        [aavePool, dytmOffice, ...midasRedemptionVaults].map(asset => asset.toLowerCase()),
    );

    return fundCompositions.map(composition => {
        if (composition && composition.assets) {
            return composition.assets.reduce(
                (lockedTokens, [address], i) => nonTokenAssets.has(address.toLowerCase())
                    ? lockedTokens
                    : {...lockedTokens, [address]: composition.balances[i]},
                {},
            )
        }
    })
}

async function processAaveTvl(aaveVaults, api, AAVE_POOL, AAVE_POOL_DATA_PROVIDER) {
    if (aaveVaults.length === 0 || !AAVE_POOL || !AAVE_POOL_DATA_PROVIDER) return

    const aaveReservesList = await api.call({ abi: AAVE_GET_RESERVES_LIST, target: AAVE_POOL });

    const aaveQueryParams = [];
    aaveReservesList.forEach(asset => aaveVaults.forEach(vault => aaveQueryParams.push({ params: [asset, vault], })));
    const aavePositions = await api.multiCall({ abi: AAVE_GET_USER_RESERVE_DATA, target: AAVE_POOL_DATA_PROVIDER, calls: aaveQueryParams });

    for (const i in aavePositions) {
        const aavePosition = aavePositions[i];
        const collateral = BigInt(aavePosition.currentATokenBalance);
        const debt = BigInt(aavePosition.currentStableDebt) + BigInt(aavePosition.currentVariableDebt);

        api.addToken(aaveQueryParams[i].params[0], collateral - debt);
    }
}

async function processDytmTvl(vaults, fundCompositions, api, dhedgeFactory, dytmOffice) {
    // multiCall preserves call order, so each composition has the same index as its vault.
    const dytmVaults = vaults.filter((_, i) =>
        fundCompositions[i]?.assets.some(([asset]) => asset.toLowerCase() === dytmOffice.toLowerCase()),
    );
    if (dytmVaults.length === 0) return

    const contractGuard = await api.call({
        abi: DHEDGE_GET_CONTRACT_GUARD,
        target: dhedgeFactory,
        params: [dytmOffice],
    });
    const periphery = await api.call({ abi: DYTM_GET_PERIPHERY, target: contractGuard });
    const marketIds = await api.multiCall({
        abi: DYTM_GET_OWNED_MARKET_IDS,
        calls: dytmVaults.map(vault => ({ target: contractGuard, params: [vault] })),
    });

    const dytmQueryParams = [];
    marketIds.forEach((ids, i) => ids.forEach(marketId => dytmQueryParams.push({
        target: periphery,
        params: [BigInt(dytmVaults[i]).toString(), marketId],
    })));
    if (dytmQueryParams.length === 0) return

    const positions = await api.multiCall({
        abi: DYTM_GET_ACCOUNT_POSITION,
        calls: dytmQueryParams,
        permitFailure: true,
    });

    positions.forEach(position => {
        if (!position || BigInt(position.totalCollateralValueUSD) <= BigInt(position.debt.debtValueUSD)) return

        position.collaterals.forEach(({ asset, assets }) => api.addToken(asset, assets));
        if (BigInt(position.debt.debtAssets) > 0n) {
            api.addToken(position.debt.debtAsset, -BigInt(position.debt.debtAssets));
        }
    });
}

async function processMidasPendingRedemptions(fundCompositions, api, redemptionVaults) {
    const redemptionVaultSet = new Set(redemptionVaults.map(asset => asset.toLowerCase()));
    const pendingRedemptions = [];

    fundCompositions.forEach(composition => {
        composition?.assets.forEach(([asset], i) => {
            const balance = composition.balances[i];
            if (redemptionVaultSet.has(asset.toLowerCase()) && BigInt(balance) > 0n) {
                pendingRedemptions.push({ redemptionVault: asset, balance });
            }
        });
    });
    if (pendingRedemptions.length === 0) return

    const mTokens = await api.multiCall({
        abi: MIDAS_GET_M_TOKEN,
        calls: pendingRedemptions.map(({ redemptionVault }) => redemptionVault),
    });
    // The pending-redemption asset guard reports balances directly in mToken units (18 decimals).
    pendingRedemptions.forEach(({ balance }, i) => api.addToken(mTokens[i], balance));
}


async function tvlForChain(api) {
    const { chain, } = api
    const isEthereum = chain === "ethereum";

    const assetBalances = await getLockedAssetsForFunds(api);
    assetBalances
        .filter(Boolean)
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
    misrepresentedTokens: false,
    start: "2025-08-12",
    methodology:
        "Aggregates the token composition of active mStable vaults listed by the frontend, including net Aave and DYTM positions and pending Midas redemptions",
    ethereum: {
        tvl: tvlForChain,
    },

};
