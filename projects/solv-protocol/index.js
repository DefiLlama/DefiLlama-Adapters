const sdk = require("@defillama/sdk");
const axios = require('axios')
const { request, gql } = require("graphql-request");
const { default: BigNumber } = require("bignumber.js");
const { transformBscAddress, transformPolygonAddress, transformArbitrumAddress, getChainTransform } = require("../helper/portedTokens");
const abi = require("./abi.json");

// token list
const tokenListsApiEndpoint = "https://token-list.solv.finance/vouchers-prod.json"

// The Graph
const graphUrlList = {
    ethereum: 'https://api.studio.thegraph.com/query/40045/solv-payable-factory-prod/v0.0.1',
    bsc: 'https://api.thegraph.com/subgraphs/name/slov-payable/solv-v3-earn-factory',
    arbitrum: 'https://api.studio.thegraph.com/query/40045/solv-payable-factory-arbitrum/v0.0.1',
}

const ethereumTVL = async (timestamp, block, chainBlocks) => {
    return tvl(timestamp, block, chainBlocks, "ethereum", 1);
}

const polygonTVL = async (timestamp, block, chainBlocks) => {
    return tvl(timestamp, block, chainBlocks, "polygon", 137);
}

const arbitrumTVL = async (timestamp, block, chainBlocks) => {
    return tvl(timestamp, block, chainBlocks, "arbitrum", 42161);
};

const bscTVL = async (timestamp, block, chainBlocks) => {
    return tvl(timestamp, block, chainBlocks, "bsc", 56);
};

async function tvl(timestamp, block, chainBlocks, network, chainId) {
    let balances = {}; // Setup the balances object
    const tokens = await tokenList(chainId);
    try {
        const balanceOfList = (
            await sdk.api.abi.multiCall({
                abi: abi.balanceOf,
                calls: tokens.map((index) => ({
                    target: index.address,
                    params: [index.pool]
                })),
                block,
                chain: network,
            })
        ).output.map((balanceOf) => balanceOf.output);
        for (let i = 0; i < balanceOfList.length; i++) {
            sdk.util.sumSingleBalance(balances, `${network}:${tokens[i]["address"]}`, balanceOfList[i]);
        }
    } catch (error) {

    }

    if (graphUrlList[network]) {
        balances = await (graphEarn(balances, timestamp, chainBlocks, network))
    }

    return balances;
}

async function graphEarn(balances, timestamp, chainBlocks, network) {
    const block = chainBlocks[network];
    const slots = await getSlot(timestamp, network);

    const concretes = await concrete(slots, block, network);

    const totalValues = (
        await sdk.api.abi.multiCall({
            abi: abi.slotTotalValue,
            calls: slots.map((index) => ({
                target: concretes[index.contractAddress],
                params: [index.slot]
            })),
            block,
            chain: network,
        })
    ).output.map((totalValue) => totalValue.output);

    const baseInfos = (
        await sdk.api.abi.multiCall({
            abi: abi.slotBaseInfo,
            calls: slots.map((index) => ({
                target: concretes[index.contractAddress],
                params: [index.slot]
            })),
            block,
            chain: network,
        })
    ).output.map((baseInfo) => baseInfo.output);

    const decimalList = (
        await sdk.api.abi.multiCall({
            abi: abi.decimals,
            calls: baseInfos.map((index) => ({
                target: index[1],
            })),
            block,
            chain: network,
        })
    ).output.map((baseInfo) => baseInfo.output);

    for (let i = 0; i < totalValues.length; i++) {
        const decimals = decimalList[i];
        const balance = BigNumber(totalValues[i]).div(BigNumber(10).pow(18 - decimals)).toNumber();
        sdk.util.sumSingleBalance(balances, `${network}:${baseInfos[i][1]}`, balance);
    }

    return balances
}

async function tokenList(chainId) {
    let tokens = [];
    const allTokens = (await axios.get(tokenListsApiEndpoint)).data.tokens;
    for (let token of allTokens) {
        if (chainId == token.chainId) {
            if (token.extensions.voucher.underlyingToken != undefined) {
                if (token.extensions.voucher.underlyingToken.symbol != "SOLV" && token.extensions.voucher.underlyingToken.symbol.indexOf("_") == -1) {
                    tokens.push({
                        address: token.extensions.voucher.underlyingToken.address,
                        pool: token.extensions.voucher.vestingPool
                    })
                }
            }
        }
    }

    return tokens;
}

async function concrete(slots, block, chain) {
    var slotsList = [];
    var only = {};
    for (var i = 0; i < slots.length; i++) {
        if (!only[slots[i].contractAddress]) {
            slotsList.push(slots[i]);
            only[slots[i].contractAddress] = true;
        }
    }

    const concreteLists = (
        await sdk.api.abi.multiCall({
            calls: slotsList.map((index) => ({
                target: index.contractAddress,
            })),
            abi: abi.concrete,
            chain,
            block
        })
    ).output.map((concrete) => concrete.output);

    let concretes = {};
    for (var i = 0; i < concreteLists.length; i++) {
        concretes[slotsList[i].contractAddress] = concreteLists[i];
    }

    return concretes;
}


async function getSlot(timestamp, chain) {
    const slotDataQuery = gql`
        query BondSlotInfos {
            bondSlotInfos(first: 1000, where:{maturity_gt:${timestamp}}) {
                contractAddress
                slot
            }
        }
`;
    const slots = (await request(graphUrlList[chain], slotDataQuery)).bondSlotInfos;

    return slots;
}
// node test.js projects/solv-protocol/index.js
module.exports = {
    ethereum: {
        tvl: ethereumTVL
    },
    bsc: {
        tvl: bscTVL
    },
    polygon: {
        tvl: polygonTVL
    },
    arbitrum: {
        tvl: arbitrumTVL
    }
};
