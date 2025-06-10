const ethers = require("ethers");

const MARKET_LENS = "0x7fB0d63E84D847569ca75A6cdbA283bA1401F9f6";
const ADDRESS_REGISTRY = "0x86ccFbEc579D491e9b37354187dD48a1a9C7c1E7";

const ABI = {
    AddressRegistry: {
        getAddresses:
            "function getAddresses(bytes32[] keys) view returns (address[])",
    },
    MarketLens: {
        getMarketQuery:
            "function getMarketQuery(uint256 marketId) view returns (tuple(address marketAsset, string marketAssetSymbol, uint8 marketAssetDecimals, uint256 maxSupply, uint256 totalShares, uint256 totalAssets, uint256 exchangeRate, uint256 totalReserveAssets, uint256 totalLiabilities, uint256 utilization, uint256 borrowRate, uint256 supplyRate))",
        getCollateralAssetsQuery:
            "function getCollateralAssetsQuery(uint256 marketId) view returns (tuple(address token, string symbol, uint8 decimals, address priceOracle, uint256 price, uint256 totalSupply, uint256 totalValue, uint256 maxSupply, uint256 maxLTV, uint256 liquidationLTV, uint256 liquidationDiscount)[])",
    },
    Erc4626: {
        totalAssets:
            "function totalAssets() view returns (uint256 totalManagedAssets)",
        asset: "function asset() view returns (address assetTokenAddress)",
    },
};

const vaults = [
    "0x9271A5C684330B2a6775e96B3C140FC1dC3C89be",
    "0xaEAAD6d9B096829E5F3804a747C9FDD6677d78f0",
    "0x72EE42bd660e4f676106C3718b00af06257c9d35",
];

async function lookupAddresses(api, keys) {
    return await api.call({
        abi: ABI.AddressRegistry.getAddresses,
        target: ADDRESS_REGISTRY,
        params: [keys.map((key) => ethers.keccak256(ethers.toUtf8Bytes(key)))],
    });
}

async function getAllMarkets(api) {
    const markets = [];
    let i = 1;
    let stop = false;

    while (!stop) {
        const addresses = await lookupAddresses(api, [
            `hyperdrive.market.${i}`,
        ]);
        if (addresses[0] !== "0x0000000000000000000000000000000000000000") {
            markets.push(addresses[0]);
            i++;
        } else {
            stop = true;
        }
    }

    return markets;
}

async function tvl(api) {
    const markets = await getAllMarkets(api);
    const marketIds = markets.map((_, i) => i + 1);

    const marketData = await api.multiCall({
        target: MARKET_LENS,
        calls: marketIds,
        abi: ABI.MarketLens.getMarketQuery,
    });
    const collateralData = await api.multiCall({
        target: MARKET_LENS,
        calls: marketIds,
        abi: ABI.MarketLens.getCollateralAssetsQuery,
    });

    marketData.forEach((datum, i) => {
        api.add(datum.marketAsset, datum.totalAssets);

        const collateralDatum = collateralData[i];
        const totalCollateral = collateralDatum.reduce((previous, current) => {
            return previous + BigInt(current.totalValue);
        }, 0n);
        api.add(datum.marketAsset, totalCollateral);
    });

    const totalAssets = await api.multiCall({
        calls: vaults,
        abi: ABI.Erc4626.totalAssets,
    });
    const assets = await api.multiCall({
        calls: vaults,
        abi: ABI.Erc4626.asset,
    });
    assets.forEach((asset, i) => {
        api.add(asset, totalAssets[i]);
    });

    return api.getBalances();
}

async function borrowed(api) {
    const markets = await getAllMarkets(api);
    const marketIds = markets.map((_, i) => i + 1);

    const marketData = await api.multiCall({
        target: MARKET_LENS,
        calls: marketIds,
        abi: ABI.MarketLens.getMarketQuery,
    });

    marketData.forEach((datum) => {
        api.add(datum.marketAsset, datum.totalLiabilities);
    });

    return api.getBalances();
}

module.exports = {
    hyperliquid: {
        tvl,
        borrowed,
    },
    methodology: "Gets the TVL for the protocol",
};
