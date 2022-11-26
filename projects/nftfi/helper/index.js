const sdk = require("@defillama/sdk");
const abi = require("../../helper/abis/chainlink.json");
const { nftPriceFeeds } = require('../../helper/tokenMapping');

// Tokens
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

// Vaults
const v2 = "0xf896527c49b44aAb3Cf22aE356Fa3AF8E331F280";
const v2_1 = "0x8252Df1d8b29057d1Afe3062bf5a64D503152BC8";

async function getTVL(balances, chain, timestamp, chainBlocks) {
    // Get v2 deposited collateral
    const { output: v2Positions } = await sdk.api.abi.multiCall({
        calls: nftPriceFeeds[chain].map((priceFeed) => ({
            target: priceFeed.token, params: [v2]
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks[chain],
        chain,
    });

    // Get v2_1 deposited collateral
    const { output: v21Positions } = await sdk.api.abi.multiCall({
        calls: nftPriceFeeds[chain].map((priceFeed) => ({
            target: priceFeed.token, params: [v2_1]
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks[chain],
        chain,
    });

    // Get floor prices from Chainlink feeds
    const { output: floorPrices } = await sdk.api.abi.multiCall({
        calls: nftPriceFeeds[chain].map((priceFeed) => ({
            target: priceFeed.oracle,
        })),
        abi: abi.latestAnswer,
        block: chainBlocks[chain],
        chain,
    });

    let collateralValueETH = 0;
    for (let i = 0; i < v2Positions.length; i++) {
        const floorPrice = floorPrices[i].output;
        const position = Number(v2Positions[i].output) + Number(v21Positions[i].output);
        collateralValueETH += position * floorPrice;
    }

    sdk.util.sumSingleBalance(balances, `${chain}:${WETH}`, collateralValueETH);
    return balances;
}

module.exports = {
    getTVL,
};
