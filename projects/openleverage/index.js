const sdk = require('@defillama/sdk');
const {gql, GraphQLClient} = require("graphql-request");
const retry = require("../helper/retry");
const utils = require("../helper/utils");
const { sumTokens2 } = require('../helper/unwrapLPs')

const openleve_address = {
    "eth" : '0x03bf707deb2808f711bb0086fc17c5cafa6e8aaf',
    "bsc" : '0x6A75aC4b8d8E76d15502E69Be4cb6325422833B4',
    "kcc" : '0xEF6890d740E1244fEa42E3D1B9Ff515C24c004Ce'
}
const subgraph_endpoint = {
    "eth" : 'https://api.thegraph.com/subgraphs/name/openleveragedev/openleverage',
    "bsc" : 'https://api.thegraph.com/subgraphs/name/openleveragedev/openleverage-bsc'
}
const http_endpoint = {
    "kcc" : 'https://kcc.openleverage.finance/api/trade/markets/stat?page=1&size=1000',
}

async function eth_tvl(timestamp, block) {
    const poolInfo = await getPoolFromSubgraph("eth");
    const toa = []    
    for (const pool of poolInfo["poolAddressList"]) {
        const poolToken = poolInfo["poolToken"][pool]
        toa.push([poolToken, pool])
    }
    for (const token of poolInfo["tokenAddressList"]) {
        toa.push([token, openleve_address["eth"]])
    }
    return sumTokens2({ block, tokensAndOwners: toa, })
}

async function bsc_tvl(timestamp, _block, { bsc: block }) {
    const toa = []    
    const poolInfo = await getPoolFromSubgraph("bsc");
    for (const pool of poolInfo["poolAddressList"]) {
        const poolToken = poolInfo["poolToken"][pool]
        toa.push([poolToken, pool])
    }
    for (const token of poolInfo["tokenAddressList"]) {
        toa.push([token, openleve_address["bsc"]])
    }
    return sumTokens2({ chain: 'bsc', block, tokensAndOwners: toa, })
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
    for (const s of results["data"]["data"]) {
        tokenAddressList.push(s["token0Addr"])
        poolAddressList.push(s["pool0Addr"])
        poolToken[s["pool0Addr"]] = s["token1Addr"]

        tokenAddressList.push(s["token1Addr"])
        poolAddressList.push(s["pool1Addr"])
        poolToken[s["pool1Addr"]] = s["token0Addr"]
    }
    return {"tokenAddressList" : Array.from(new Set(tokenAddressList)), "poolAddressList" : poolAddressList, "poolToken": poolToken}
}

async function kcc_tvl(timestamp, _block, { kcc: block }) {
    const toa = []    
    const poolInfo = await getPoolFromHttp("kcc");
    for (const pool of poolInfo["poolAddressList"]) {
        const poolToken = poolInfo["poolToken"][pool]
        toa.push([poolToken, pool])
    }

    for (const token of poolInfo["tokenAddressList"]) {
        toa.push([token, openleve_address["kcc"]])
    }
    return sumTokens2({ chain: 'kcc', block, tokensAndOwners: toa, })
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
    } 
}