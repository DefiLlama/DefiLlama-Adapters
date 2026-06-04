const ADDRESSES = require("../helper/coreAssets.json");
const ethers = require("ethers");
const { sumTokens2 } = require("../helper/unwrapLPs");

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

async function getAllMarkets(api) {
    const keys = [];
    for (let i = 0; i < 100; i++) {
        keys.push(
            ethers.keccak256(ethers.toUtf8Bytes(`hyperdrive.market.${i}`))
        );
    }

    const markets = await api.call({
        abi: ABI.AddressRegistry.getAddresses,
        target: ADDRESS_REGISTRY,
        params: [keys],
        permitFailure: true,
    });

    return markets.filter((market) => market !== ADDRESSES.null);
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
  
    const tokensAndOwners = [];
    marketData.forEach((datum, i) => {
        const tokens = new Set()

        tokens.add(datum.marketAsset)
        collateralData[i].map(col => {
          tokens.add(col.token)
        })

        for (const token of Array.from(tokens)) {
          tokensAndOwners.push([token, markets[i]])
        }
        // count only remaining assets liquidity
        // api.add(datum.marketAsset, datum.totalReserveAssets);

        // const collateralDatum = collateralData[i];
        // const totalCollateral = collateralDatum.reduce((previous, current) => {
        //     return previous + BigInt(current.totalValue);
        // }, 0n);
        // api.add(datum.marketAsset, totalCollateral);
    });
  
    return await sumTokens2({ api, tokensAndOwners })
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
    methodology: "Gets the assets deposited across all lending pools.",
};
