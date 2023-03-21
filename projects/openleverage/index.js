const sdk = require('@defillama/sdk');
const erc20 = require("../helper/abis/erc20.json");
const {gql, GraphQLClient} = require("graphql-request");
const retry = require("../helper/retry");
const utils = require("../helper/utils");

const openleve_address = {
    "eth" : '0x03bf707deb2808f711bb0086fc17c5cafa6e8aaf',
    "bsc" : '0x6A75aC4b8d8E76d15502E69Be4cb6325422833B4',
    "kcc" : '0xEF6890d740E1244fEa42E3D1B9Ff515C24c004Ce',
    "arbitrum" : '0x2925671dc7f2def9e4ad3fa878afd997f0b4db45'
}
const subgraph_endpoint = {
    "eth" : 'https://api.thegraph.com/subgraphs/name/openleveragedev/openleverage',
    "bsc" : 'https://api.thegraph.com/subgraphs/name/openleveragedev/openleverage-bsc'
}
const http_endpoint = {
    "kcc" : 'https://kcc.openleverage.finance/api/info/pools',
    "arbitrum" : 'https://arbitrum.openleverage.finance/api/info/pools'
}

async function eth_tvl(timestamp, block) {
    const poolInfo = await getPoolFromSubgraph("eth");
    const balances = {}
    for (const pool of poolInfo["poolAddressList"]) {
        const poolToken = poolInfo["poolToken"][pool]
        const poolBalance = (
            await sdk.api.abi.call({
                abi: erc20.balanceOf,
                target: poolToken,
                params: pool
            })
        ).output;
        sdk.util.sumSingleBalance(balances, poolToken, poolBalance);
    }
    for (const token of poolInfo["tokenAddressList"]) {
        const openLeveBalance = (
            await sdk.api.abi.call({
                abi: erc20.balanceOf,
                target: token,
                params: openleve_address["eth"]
            })
        ).output;
        sdk.util.sumSingleBalance(balances, token, openLeveBalance);
    }
    return balances
}

async function bsc_tvl(timestamp, block, chainBlocks) {
    const poolInfo = await getPoolFromSubgraph("bsc");
    const balances = {}
    for (const pool of poolInfo["poolAddressList"]) {
        const poolToken = poolInfo["poolToken"][pool]
        const poolBalance = (
            await sdk.api.abi.call({
                abi: erc20.balanceOf,
                target: poolToken,
                chain: 'bsc',
                params: pool
            })
        ).output;
        sdk.util.sumSingleBalance(balances,"bsc:" + poolToken, poolBalance);
    }
    for (const token of poolInfo["tokenAddressList"]) {
        const openLeveBalance = (
            await sdk.api.abi.call({
                abi: erc20.balanceOf,
                target: token,
                chain: 'bsc',
                params: openleve_address["bsc"]
            })
        ).output;
        sdk.util.sumSingleBalance(balances, "bsc:" + token, openLeveBalance);
    }
    return balances
}

async function getPoolFromSubgraph(chain) {
    var sql =  gql`{
        pairs(first: 1000) {
            id
            token0 {
            id
            }
            token1 {
            id
            }
            pool0
            pool1
        }
    }
  `;
    var graphQLClient = new GraphQLClient(subgraph_endpoint[chain])
    const results = await retry(async bail => await graphQLClient.request(sql))
    const tokenAddressList = []
    const poolAddressList = []
    const poolToken = {}
    for (const s of results["pairs"]) {
        tokenAddressList.push(s["token0"]["id"])
        poolAddressList.push(s["pool0"])
        poolToken[s["pool0"]] = s["token0"]["id"]

        tokenAddressList.push(s["token1"]["id"])
        poolAddressList.push(s["pool1"])
        poolToken[s["pool1"]] = s["token1"]["id"]
    }
    return {"tokenAddressList" : Array.from(new Set(tokenAddressList)), "poolAddressList" : poolAddressList, "poolToken": poolToken}
}

async function getPoolFromHttp(chain) {
    const results = await utils.fetchURL(http_endpoint[chain])
    const tokenAddressList = []
    const poolAddressList = []
    const poolToken = {}
    for (const s of results["data"]["data"]["pools"]) {
        tokenAddressList.push(s["tokenAddr"])
        poolAddressList.push(s["poolAddr"])
        poolToken[s["poolAddr"]] = s["tokenAddr"]
    }
    return {"tokenAddressList" : Array.from(new Set(tokenAddressList)), "poolAddressList" : poolAddressList, "poolToken": poolToken}
}

async function kcc_tvl(timestamp, block) {
    const poolInfo = await getPoolFromHttp("kcc");
    const balances = {}
    for (const pool of poolInfo["poolAddressList"]) {
        const poolToken = poolInfo["poolToken"][pool]
        const poolBalance = (
            await sdk.api.abi.call({
                abi: erc20.balanceOf,
                target: poolToken,
                chain: 'kcc',
                params: pool
            })
        ).output;
        sdk.util.sumSingleBalance(balances,"kcc:" + poolToken, poolBalance);
    }

    for (const token of poolInfo["tokenAddressList"]) {
        const openLeveBalance = (
            await sdk.api.abi.call({
                abi: erc20.balanceOf,
                target: token,
                chain: 'kcc',
                params: openleve_address["kcc"]
            })
        ).output;
        sdk.util.sumSingleBalance(balances, "kcc:" + token, openLeveBalance);
    }
    return balances
}

async function arbitrum_tvl(timestamp, block) {
    const poolInfo = await getPoolFromHttp("arbitrum");
    const balances = {}
    for (const pool of poolInfo["poolAddressList"]) {
        const poolToken = poolInfo["poolToken"][pool]
        const poolBalance = (
            await sdk.api.abi.call({
                abi: erc20.balanceOf,
                target: poolToken,
                chain: 'arbitrum',
                params: pool
            })
        ).output;
        sdk.util.sumSingleBalance(balances,"arbitrum:" + poolToken, poolBalance);
    }

    for (const token of poolInfo["tokenAddressList"]) {
        const openLeveBalance = (
            await sdk.api.abi.call({
                abi: erc20.balanceOf,
                target: token,
                chain: 'arbitrum',
                params: openleve_address["arbitrum"]
            })
        ).output;
        sdk.util.sumSingleBalance(balances, "arbitrum:" + token, openLeveBalance);
    }
    return balances
}


module.exports = {
    methodology: "get pool and token address from the openleverage subgraph",
    ethereum: {
        tvl: eth_tvl
    },
    bsc: {
        tvl: bsc_tvl
    },
    kcc: {
        tvl: kcc_tvl
    },
    arbitrum: {
        tvl: arbitrum_tvl
    }
}