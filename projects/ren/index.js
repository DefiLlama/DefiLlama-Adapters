const ADDRESSES = require('../helper/coreAssets.json')
const { request, gql } = require("graphql-request");
const sdk = require("@defillama/sdk");
const { getTokenSupply } = require('../helper/solana')

const ethGraphUrl = sdk.graph.modifyEndpoint('AJaQdD8DUunuwHCbAsZk5h62AfyNG1etRtK9EcDH7gwH');
const bscGraphUrl =
    sdk.graph.modifyEndpoint('6UCMxzH5LPvZrLhcpSVrSDhoKRYJchvHM7vnTUo2bBp2');
const avalancheGraphUrl =
    sdk.graph.modifyEndpoint('GBRcEpUZTHMyjmtkPsHMYmHuPtcLFqnU5SPvpaLdfmau');
const fantomGraphUrl =
    sdk.graph.modifyEndpoint('2TV9sKK7fLvfsbnUox6irt3XbiHAzw1fvbh9j8vnBXmH');
const polygonGraphUrl =
    sdk.graph.modifyEndpoint('GQCGcDW16JfawMXegTemUte8PPyJQVvtF6kACvMYwX8V');
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

function symbol(s) {
    switch (s) {
        case "renDGB":
            return "digibyte"
        case "renLUNA":
            return "terra-luna"
        default:
            return s
    }
}

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
            symbol(asset.symbol), // We assume the symbol is the same as the Coingecko ID.
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

async function arbitrum(timestamp, ethBlock, chainBlocks) {
    return {
        "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d": (await sdk.api.erc20.totalSupply({
            target: ADDRESSES.fantom.renBTC,
            chain: "arbitrum",
            block: chainBlocks.arbitrum
        })).output
    }
}

async function kava(timestamp, ethBlock, chainBlocks) {
    return {
        "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d": (await sdk.api.erc20.totalSupply({
            target: "0x85f6583762Bc76d775eAB9A7456db344f12409F7",
            chain: "kava",
            block: chainBlocks.kava
        })).output
    }
}

async function optimism(timestamp, ethBlock, chainBlocks) {
    return {
        "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d": (await sdk.api.erc20.totalSupply({
            target: "0x85f6583762Bc76d775eAB9A7456db344f12409F7",
            chain: "optimism",
            block: chainBlocks.optimism
        })).output
    }
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

async function solana() {
    // https://renproject.github.io/ren-client-docs/contracts/deployments/
    const tokens = [
        ["renBTC", "CDJWUqTcYTVAKXAVXoQZFes5JUFc7owSeq7eMQcDSbo5"],
        ["renZEC", "E99CQ2gFMmbiyK2bwiaFNWUUmwz4r8k2CVEFxwuvQ7ue"],
        ["renBCH", "G1a6jxYz3m8DVyMqYnuV7s86wD4fvuXYneWSpLJkmsXj"],
        ["renFIL", "De2bU64vsXKU9jq4bCjeDxNRGPn8nr3euaTK8jBYmD3J"],
        ["renDGB", "FKJvvVJ242tX7zFtzTmzqoA631LqHh4CdgcN8dcfFSju"],
        ["renDOGE", "ArUkYE2XDKzqy77PRRGjo4wREWwqk6RXTfM9NeqzPvjU"],
        ["renLUNA", "8wv2KAykQstNAj2oW6AHANGBiFKVFhvMiyyzzjhkmGvE"],
    ]
    const balances = {}
    await Promise.all(tokens.map(async token => {
        balances[symbol(token[0])] = await getTokenSupply(token[1])
    }))
    return balances
}

module.exports = {
        solana: {
        tvl: solana
    },
    ethereum: {
        tvl: eth,
    },
    avax:{
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
    arbitrum: {
        tvl: arbitrum
    },
    kava: {
        tvl: kava
    },
    optimism: {
        tvl: optimism
    },
};
