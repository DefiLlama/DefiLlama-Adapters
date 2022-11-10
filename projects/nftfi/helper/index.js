const sdk = require("@defillama/sdk");
const abi = require("./abis");

// Tokens
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

// Vaults
const v2 = "0xf896527c49b44aAb3Cf22aE356Fa3AF8E331F280";
const v2_1 = "0x8252Df1d8b29057d1Afe3062bf5a64D503152BC8";

const COLLECTION_TO_FEED = [
    {   // Azuki
        address: "0xed5af388653567af2f388e6224dc7c4b3241c544", 
        oracle: "0xA9cdBbDE36803af377735233e6BD261cDA5aD11d",
    },
    {   // BAYC
        address: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d", 
        oracle: "0x0CA05B24795eb4f5bA5237e1D4470048cc0fE235",
    },
    {   // CloneX
        address: "0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b", 
        oracle: "0x13E6C463BEC76873E4e63ce5169e9a95b7e06801",
    },
    {   // Cryptopunks
        address: "0xb7f7f6c52f2e2fdb1963eab30438024864c313f6", 
        oracle: "0x35f08E1b5a18F1F085AA092aAed10EDd47457484",
    },
    {   // Doodles
        address: "0x8a90cab2b38dba80c64b7734e58ee1db38b8992e", 
        oracle: "0x68Ff67118F778Bd158DA8D49B156aC5Ad9d8c4Ed",
    },
    {   // MAYC
        address: "0x60e4d786628fea6478f785a6d7e704777c86a7c6", 
        oracle: "0xE6A7b525609bF47889ac9d0e964ebB640750a01C",
    },
    {   // Pudgy Penguins
        address: "0xbd3531da5cf5857e7cfaa92426877b022e612cf8", 
        oracle: "0xaC9962D846D431254C7B3Da3AA12519a1E2Eb5e7",
    },
];

async function getTVL(balances, chain, timestamp, chainBlocks) {
    // Get v2 deposited collateral
    const { output: v2Positions } = await sdk.api.abi.multiCall({
        calls: COLLECTION_TO_FEED.map((collToFeed) => ({
            target: collToFeed.address, params: [v2]
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks[chain],
        chain,
    });

    // Get v2_1 deposited collateral
    const { output: v21Positions } = await sdk.api.abi.multiCall({
        calls: COLLECTION_TO_FEED.map((collToFeed) => ({
            target: collToFeed.address, params: [v2_1]
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks[chain],
        chain,
    });

    // Get floor prices from Chainlink feeds
    const { output: floorPrices } = await sdk.api.abi.multiCall({
        calls: COLLECTION_TO_FEED.map((collToFeed) => ({
            target: collToFeed.oracle,
        })),
        abi: abi.abis.latestAnswer,
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
