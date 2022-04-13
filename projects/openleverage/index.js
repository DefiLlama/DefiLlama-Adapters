const sdk = require('@defillama/sdk');
const erc20 = require("../helper/abis/erc20.json");
const {gql, GraphQLClient} = require("graphql-request");
const retry = require("../helper/retry");

openleve_address = {
    "eth" : '0x03bf707deb2808f711bb0086fc17c5cafa6e8aaf',
    "bsc" : '0x6A75aC4b8d8E76d15502E69Be4cb6325422833B4',
    "kcc" : '0xEF6890d740E1244fEa42E3D1B9Ff515C24c004Ce'
}
subgraph_endpoint = {
    "eth" : 'https://api.thegraph.com/subgraphs/name/openleveragedev/openleverage',
    "bsc" : 'https://api.thegraph.com/subgraphs/name/openleveragedev/openleverage-bsc'
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
    tokenAddressList = []
    poolAddressList = []
    poolToken = {}
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

async function kcc_tvl(timestamp, block) {
    const logOutput = (await sdk.api.util.getLogs({
        target: "0x8A2F01b39319de1dFE219090018B6F460e968e00",
        fromBlock: 8666781,
        toBlock: block,
        chain: 'kcc',
        keys:[],
        topic:'LPoolPairCreated(address,address,address,address,uint16,uint16,bytes)'
    })).output

    tokenAddressList = []
    poolAddressList = []
    poolToToken = {}

    for (const s of logOutput) {
        token0 = "0x"+s.data.slice(26, 66)
        tokenAddressList.push(token0)
        pool0 = "0x"+s.data.slice(90, 130)
        poolAddressList.push(pool0)
        poolToToken[pool0] = token0

        token1 = "0x"+s.data.slice(154, 194)
        tokenAddressList.push(token1)
        pool1 = "0x"+s.data.slice(218, 258)
        poolAddressList.push(pool1)
        poolToToken[pool1] = token1

    }
    tokenAddressList = Array.from(new Set(tokenAddressList))

    const balances = {}
    for (const pool of poolAddressList) {
        const poolBalance = (
            await sdk.api.abi.call({
                abi: erc20.balanceOf,
                target: poolToToken[pool],
                chain: 'kcc',
                params: pool
            })
        ).output;
        sdk.util.sumSingleBalance(balances,"kcc:" + poolToToken[pool], poolBalance);
    }
    for (const token of tokenAddressList) {
        const openleveBalance = (
            await sdk.api.abi.call({
                abi: erc20.balanceOf,
                target: token,
                chain: 'kcc',
                params: openleve_address["kcc"]
            })
        ).output;
        sdk.util.sumSingleBalance(balances, "kcc:" + token, openleveBalance);
    }
    return balances
}

module.exports = {
    name: 'openleverage',
    website: 'https://openleverage.finance',
    methodology: "get pool and token address from the openleverage subgraph",
    token: 'OLE',
    start: 1638720000,
    ethereum: {
        tvl: eth_tvl
    },
    bsc: {
        tvl: bsc_tvl
    },
    kcc: {
        tvl: kcc_tvl
    }

}