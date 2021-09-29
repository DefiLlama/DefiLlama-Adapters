const { request, gql } = require("graphql-request");
const sdk = require("@defillama/sdk");

const ethGraphUrl = "https://api.thegraph.com/subgraphs/name/renproject/renvm";
const bscGraphUrl =
    "https://api.thegraph.com/subgraphs/name/renproject/renvm-binance-smart-chain";
const avalancheGraphUrl =
    "https://api.thegraph.com/subgraphs/name/renproject/renvm-avalanche";
const fantomGraphUrl =
    "https://api.thegraph.com/subgraphs/name/renproject/renvm-fantom";
const polygonGraphUrl =
    "https://api.thegraph.com/subgraphs/name/renproject/renvm-polygon";
const graphQuery = gql`
  {
    assets {
      symbol
      tokenAddress
      decimals
    }
  }
`;
const darknodeStakingContract = "0x60Ab11FE605D2A2C3cf351824816772a131f8782";
const renToken = "0x408e41876cCCDC0F92210600ef50372656052a38";

async function getAssetBalance(block, graphUrl, chain) {
    const balances = {};
    const { assets } = await request(graphUrl, graphQuery);
    const assetCalls = assets.map((asset) => ({
        target: asset.tokenAddress,
    }));
    const totalSupplies = sdk.api.abi.multiCall({
        abi: "erc20:totalSupply",
        block,
        chain,
        calls: assetCalls,
    });

    const resolvedSupplies = (await totalSupplies).output;
    assets.forEach((asset, index) => {
        if (!resolvedSupplies[index].success) {
            throw new Error("totalSupply() failed");
        }
        sdk.util.sumSingleBalance(
            balances,
            asset.symbol, // We assume the symbol is the same as the Coingecko ID.
            resolvedSupplies[index].output / 10 ** asset.decimals,
        );
    });
    return balances;
}

async function bsc(timestamp, ethBlock, chainBlocks) {
    return getAssetBalance(
        chainBlocks["bsc"],
        bscGraphUrl,
        "bsc"
    );
}

async function avax(timestamp, ethBlock, chainBlocks) {
    return getAssetBalance(
        chainBlocks["avax"],
        avalancheGraphUrl,
        "avax"
    );
}

async function fantom(timestamp, ethBlock, chainBlocks) {
    return getAssetBalance(
        chainBlocks["fantom"],
        fantomGraphUrl,
        "fantom"
    );
}

async function polygon(timestamp, ethBlock, chainBlocks) {
    return getAssetBalance(
        chainBlocks["polygon"],
        polygonGraphUrl,
        "polygon"
    );
}

async function eth(timestamp, block) {
    const balances = await getAssetBalance(
        block,
        ethGraphUrl,
        "ethereum"
    );
    const stakedRen = await sdk.api.abi.call({
        target: renToken,
        abi: "erc20:balanceOf",
        params: [darknodeStakingContract],
        block,
    });
    balances[renToken] = stakedRen.output;
    return balances;
}

module.exports = {
    ethereum: {
        tvl: eth,
    },
    avalanche: {
        tvl: avax,
    },
    bsc: {
        tvl: bsc,
    },
    fantom: {
        tvl: fantom,
    },
    polygon: {
        tvl: polygon,
    },
    tvl: sdk.util.sumChainTvls([eth, bsc, avax, fantom, polygon]),
};
