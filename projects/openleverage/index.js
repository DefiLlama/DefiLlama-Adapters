const sdk = require('@defillama/sdk');
const erc20 = require("../helper/abis/erc20.json");

controller_address = '0x0eabe8e34a1fae4601953667f811acb9ff808e78'
openlev_address = '0x03bf707deb2808f711bb0086fc17c5cafa6e8aaf'

async function tvl(timestamp, block) {
    const logOutput = (await sdk.api.util.getLogs({
        target: controller_address,
        fromBlock: 13755184,
        toBlock: block,
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
                params: pool
            })
        ).output;
        sdk.util.sumSingleBalance(balances, poolToToken[pool], poolBalance);
    }
    for (const token of tokenAddressList) {
        const openlevBalance = (
            await sdk.api.abi.call({
                abi: erc20.balanceOf,
                target: token,
                params: openlev_address
            })
        ).output;
        sdk.util.sumSingleBalance(balances, token, openlevBalance);
    }
    return balances
}



module.exports = {
  name: 'openleverage',               // project name
  website: 'https://openleverage.finance',
  token: 'OLE',
  start: 1638720000,            // 12/06/2021
  tvl                           // tvl adapter
}