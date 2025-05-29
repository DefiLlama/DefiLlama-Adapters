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
};

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

    await Promise.all(
        markets.map(async (_, i) => {
            const marketId = i + 1;

            const [marketData, collateralData] = await Promise.all([
                api.call({
                    abi: ABI.MarketLens.getMarketQuery,
                    target: MARKET_LENS,
                    params: [marketId],
                }),
                api.call({
                    abi: ABI.MarketLens.getCollateralAssetsQuery,
                    target: MARKET_LENS,
                    params: [marketId],
                }),
            ]);

            api.add(marketData.marketAsset, marketData.totalAssets);

            const totalCollateral = collateralData.reduce(
                (previous, current) => {
                    return previous + BigInt(current.totalValue);
                },
                0n
            );
            api.add(marketData.marketAsset, totalCollateral);
        })
    );

    return api.getBalances();
}

async function borrowed(api) {
    const markets = await getAllMarkets(api);

    await Promise.all(
        markets.map(async (_, i) => {
            const marketId = i + 1;

            const marketData = await api.call({
                abi: ABI.MarketLens.getMarketQuery,
                target: MARKET_LENS,
                params: [marketId],
            });

            api.add(marketData.marketAsset, marketData.totalLiabilities);
        })
    );

    return api.getBalances();
}

module.exports = {
    hyperliquid: {
        tvl,
        borrowed,
    },
    methodology: "Gets the TVL for the protocol",
};
