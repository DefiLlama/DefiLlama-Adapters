const sdk = require('@defillama/sdk');
const {gql} = require('graphql-request')
const { blockQuery } = require('../helper/graph')
const {toUSDTBalances} = require('../helper/balances');
const {getBlock} = require('../helper/getBlock');
const BigNumber = require("bignumber.js");


const axios = require('axios');
const emptyAddress = '0x0000000000000000000000000000000000000000';

async function GenerateCallList() {
    const markets = (await axios.get('https://mcdex.io/api/markets')).data.data.markets;
    const marketStatus = (await axios.get('https://mcdex.io/api/markets/status')).data.data;
    let id2Info = {};
    markets.forEach(market => {
        const id = market.id;
        if (market.contractType === 'Perpetual') {
            id2Info[id] = {perpetualAddress: market.perpetualAddress};
        }
    });
    marketStatus.forEach(status => {
        if (status === null) {
            return;
        }
        const id = status.marketID;
        if (id2Info[id] && status.perpetualStorage && status.perpetualStorage.collateralTokenAddress !== '0x0000000000000000000000000000000000000000') {
            id2Info[id].collateralTokenAddress = status.perpetualStorage.collateralTokenAddress;
        }
    });
    let calls = []
    Object.values(id2Info).map((info, id) => {
        if (info.collateralTokenAddress && info.perpetualAddress) {
            calls.push({
                target: info.collateralTokenAddress,
                params: info.perpetualAddress
            })
        }
    });
    return calls;
}


async function ethereum(timestamp, block) {
    const ethBalance = (await sdk.api.eth.getBalance({
        target: '0x220a9f0DD581cbc58fcFb907De0454cBF3777f76',
        block
    })).output;
    let balances = {
        "0x0000000000000000000000000000000000000000": ethBalance,
    };

    const erc20Calls = await GenerateCallList();
    const balanceOfResults = await sdk.api.abi.multiCall({
        block,
        calls: erc20Calls,
        abi: 'erc20:balanceOf'
    });

    await sdk.util.sumMultiBalanceOf(balances, balanceOfResults);
    return balances;
}


async function getTVL(subgraphName, block) {
    const endpoint = `https://api.thegraph.com/subgraphs/name/mcdexio/${subgraphName}`

    const query = gql`
        query getTvl {
            factories {
                id
                totalValueLockedUSD
            }
        }
    `;
    const results = await blockQuery(endpoint, query, block, 600)
    return results.factories[0].totalValueLockedUSD;
}

// for mux
async function muxTVL(chainID, chainName, subgraphName, poolAddress, block) {
    // dex value
    const dexs = (await axios.get('https://app.mux.network/api/liquidityAsset')).data.distribution.dexs;
    let dexValue = new BigNumber(0);
    dexs.forEach(dex => {
        if (dex.chainID === chainID) {
            dexValue = dexValue.plus(new BigNumber(dex.value));
        }
    });
    const balances = toUSDTBalances(dexValue);
    const endpoint = `https://api.thegraph.com/subgraphs/name/mux-world/${subgraphName}`;
    const query = gql`
        query getAssets {
            assets{
                tokenAddress
            }
        }
    `;
    const results = await blockQuery(endpoint, query, block, 600)
    let erc20Calls = []
    results.assets.forEach(asset => {
        if (asset.tokenAddress !== emptyAddress) {
            erc20Calls.push({
                target: asset.tokenAddress,
                params: poolAddress
            })
        }
    });

    const balanceOfResults = await sdk.api.abi.multiCall({
        block,
        chain: chainName,
        calls: erc20Calls,
        abi: 'erc20:balanceOf'
    });
    await sdk.util.sumMultiBalanceOf(balances, balanceOfResults);
    return balances;
}

async function arbitrum(timestamp, ethBlock, chainBlocks) {
    return toUSDTBalances(await getTVL("mcdex3-arb-perpetual", await getBlock(timestamp, "arbitrum", chainBlocks)))
}

async function muxArb(timestamp, ethBlock, chainBlocks) {
    return await muxTVL(42161, 'arbitrum', 'mux-arb', '0x3e0199792Ce69DC29A0a36146bFa68bd7C8D6633', await getBlock(timestamp, "arbitrum", chainBlocks))
}

async function bsc(timestamp, ethBlock, chainBlocks) {
    return toUSDTBalances(await getTVL("mcdex3-bsc-perpetual", await getBlock(timestamp, "bsc", chainBlocks)))
}

async function muxBsc(timestamp, ethBlock, chainBlocks) {
    return await muxTVL(56, 'bsc', 'mux-bsc', '0x855E99F768FaD76DD0d3EB7c446C0b759C96D520', await getBlock(timestamp, "bsc", chainBlocks))
}

async function fantom(timestamp, ethBlock, chainBlocks) {
    return await muxTVL(250, 'fantom', 'mux-ftm', '0x2e81F443A11a943196c88afcB5A0D807721A88E6', await getBlock(timestamp, "fantom", chainBlocks))
}

async function avax(timestamp, ethBlock, chainBlocks) {
    return await muxTVL(43114, 'avax', 'mux-ava', '0x0bA2e492e8427fAd51692EE8958eBf936bEE1d84', await getBlock(timestamp, "avax", chainBlocks))
}




module.exports = {
    misrepresentedTokens: true,
    methodology: `Includes all locked liquidity in AMM pools, pulling the data from the mcdex subgraph`,
    arbitrum: {
        tvl: sdk.util.sumChainTvls([
            arbitrum,
            muxArb,
          ])
    },
    bsc: {
        tvl: sdk.util.sumChainTvls([
            bsc,
            muxBsc,
          ])
    },
    ethereum: {
        tvl: ethereum
    },
    fantom: {
        tvl: fantom
    },
    avax: {
        tvl: avax
    }
}
