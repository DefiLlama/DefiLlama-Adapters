const sdk = require("@defillama/sdk");
const { GraphQLClient, gql } = require("graphql-request");

const arbitrumEndpoint = "https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-arbitrum";
const avaxEndpoint = "https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-avalanche-mainnet";
const bscEndpoint = "https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-bsc";
const fantomEndpoint = "https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-fantom";
const mainnetEndpoint = "https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-mainnet";
const optimismEndpoint = "https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-optimism";
const polygonEndpoint = "https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-polygon";
const xdaiEndpoint = "https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-xdai";

const queryField = gql`
    {
  llamaPayContracts(first:1000) {
    address
    token {
      id
    }
  }
}
`

const translateToken = {
    "0x91f8490ec27cbb1b2faedd29c2ec23011d7355fb": "0xdac17f958d2ee523a2206206994597c13d831ec7",
    "0x4ecaba5870353805a9f068101a40e0f32ed605c6": "0xdac17f958d2ee523a2206206994597c13d831ec7",
}

async function getTvl(block, chain, endpoint) {
    const balances = {};
    const gqlClient = new GraphQLClient(endpoint);
    const queryResults = (await gqlClient.request(queryField, {block})).llamaPayContracts;
    const tokensAndBalances = (await sdk.api.abi.multiCall({
        calls: queryResults.map((p) => ({
            target: p.token.id,
            params: p.address
        })),
        abi: "erc20:balanceOf",
        block,
        chain
    })).output;
    ;
    tokensAndBalances.map(p => {
        if (translateToken[p.input.target.toLowerCase()] !== undefined) {
            sdk.util.sumSingleBalance(balances, translateToken[p.input.target.toLowerCase()], p.output);
        } else {
            sdk.util.sumSingleBalance(balances, `${chain}:${p.input.target}`, p.output);  
        }
        
    })
    return balances
}

async function avaxTvl(timestamp, block, chainBlocks) {
    block = chainBlocks.avax;
    return getTvl(block, "avax", avaxEndpoint);
}

async function arbitrumTvl(timestamp, block, chainBlocks) {
    block = chainBlocks.arbitrum;
    return getTvl(block, "arbitrum", arbitrumEndpoint);
}

async function bscTvl(timestamp, block, chainBlocks) {
    block = chainBlocks.bsc;
    return getTvl(block, "bsc", bscEndpoint);
}

async function fantomTvl(timestamp, block, chainBlocks) {
    block = chainBlocks.fantom;
    return getTvl(block, "fantom", fantomEndpoint);
}

async function ethTvl(timestamp, block) {
    return getTvl(block, "ethereum", mainnetEndpoint);
} 

async function optimismTvl(timestamp, block) {
    return getTvl(block, "optimism", optimismEndpoint);
}

async function polygonTvl(timestamp, block, chainBlocks) {
    block = chainBlocks.polygon;
    return getTvl(block, "polygon", polygonEndpoint);
}

async function xdaiTvl(timestamp, block, chainBlocks) {
    block = chainBlocks.xdai;
    return getTvl(block, "xdai", xdaiEndpoint);
}

module.exports = {
    arbitrum: {
        tvl: arbitrumTvl
    },
    avalanche: {
        tvl: avaxTvl
    },
    bsc: {
        tvl: bscTvl
    },
    fantom: {
        tvl: fantomTvl
    },
    ethereum: {
        tvl: ethTvl
    },
    optimism: {
        tvl :optimismTvl
    },
    polygon: {
        tvl: polygonTvl
    },
    xdai: {
        tvl: xdaiTvl
    }
}