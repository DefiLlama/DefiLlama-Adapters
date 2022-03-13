const sdk = require('@defillama/sdk');
const erc20 = require("../helper/abis/erc20.json");

async function eth_tvl(timestamp, block) {
    const logOutput = (await sdk.api.util.getLogs({
        target: "0x0eabe8e34a1fae4601953667f811acb9ff808e78",
        fromBlock: 13755184,
        toBlock: block,
        keys:[],
        topic:'LPoolPairCreated(address,address,address,address,uint16,uint16,bytes)'
    })).output

    console.log(logOutput)

    let tokenAddressList = []
    let poolAddressList = []
    let poolToToken = {}
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
                params: pool
            })
        ).output;
        sdk.util.sumSingleBalance(balances, poolToToken[pool], poolBalance);
    }
    for (const token of tokenAddressList) {
        const openleveBalance = (
            await sdk.api.abi.call({
                abi: erc20.balanceOf,
                target: token,
                params: "0x03bf707deb2808f711bb0086fc17c5cafa6e8aaf"
            })
        ).output;
        sdk.util.sumSingleBalance(balances, token, openleveBalance);
    }
    return balances
}

async function bsc_tvl(timestamp, block, chainBlocks) {
    const logOutput = (await sdk.api.util.getLogs({
        target: "0x912C0462474c933499a6923a6Afc6AC1E58b8Ce4",
        fromBlock: 14436898,
        toBlock: chainBlocks.bsc,
        chain: 'bsc',
        keys:[],
        topic:'LPoolPairCreated(address,address,address,address,uint16,uint16,bytes)'
    })).output

    let tokenAddressList = []
    let poolAddressList = []
    let poolToToken = {}

    console.log(logOutput)

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
                chain: 'bsc',
                params: pool
            })
        ).output;
        sdk.util.sumSingleBalance(balances,"bsc:" + poolToToken[pool], poolBalance);
    }
    for (const token of tokenAddressList) {
        const openleveBalance = (
            await sdk.api.abi.call({
                abi: erc20.balanceOf,
                target: token,
                chain: 'bsc',
                params: "0x6A75aC4b8d8E76d15502E69Be4cb6325422833B4"
            })
        ).output;
        sdk.util.sumSingleBalance(balances, "bsc:" + token, openleveBalance);
    }
    return balances
}


module.exports = {
  name: 'openleverage', // project name
  website: 'https://openleverage.finance',
  token: 'OLE',
  start: 1638720000,// 12/06/2021
    ethereum: {
        tvl: eth_tvl
    }, 
    bsc: {
        tvl: bsc_tvl
    },
    
}