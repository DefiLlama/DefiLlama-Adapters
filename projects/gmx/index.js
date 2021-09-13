const sdk = require('@defillama/sdk');
const {getBlock} = require('../helper/getBlock')
const axios = require("axios");
const retry = require('async-retry')
const { GraphQLClient, gql } = require('graphql-request')

const VAULT = '0x489ee077994B6658eAfA855C308275EAd8097C4A';
const STAKING = '0x908C4D94D34924765f1eDc22A1DD098397c59dD4';
const GMX = '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a';
const WETH = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';
const WBTC = '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f';
const USDC = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8';

const ethWETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const ethWBTC = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
const ethUSDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

async function tvl(time, _ethBlock, chainBlocks) {
    let balances = {};

    balances[WETH] = await balanceOf(WETH, VAULT, chainBlocks);
    balances[WBTC] = await balanceOf(WBTC, VAULT, chainBlocks);
    balances[USDC] = await balanceOf(USDC, VAULT, chainBlocks);

    /*
        Convert GMX Value to ETH value
    */

    balances[WETH] = (BigInt(balances[WETH]) + BigInt(await balanceOf(GMX, STAKING, chainBlocks) * await getGmxETHPrice())).toString();
    
    return convertBalances(balances);
}

/*
    Returns the value of 1 GMX in ETH
 */

async function getGmxETHPrice(){
    var endpoint ='https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev';
    var graphQLClient = new GraphQLClient(endpoint)

    var query = gql`
    {
      pools(where: {id_in: ["0x80a9ae39310abf666a87c743d6ebbd0e8c42158e"]})
      {
        token0Price
      }
    }
  `;
    const results = await retry(async bail => await graphQLClient.request(query))

    return parseFloat(results.pools[0]['token0Price']);
}


/*
    Workaround as prices and decimals for arbitrum tokens aren't found.
 */

async function convertBalances(pBalances) {
    let balances = {};
    balances[ethWETH] = pBalances[WETH];
    balances[ethWBTC] = pBalances[WBTC];
    balances[ethUSDC] = pBalances[USDC];
    
    return balances;
}

async function balanceOf(pTarget, pParam, pChainBlocks) {
  let result = await sdk.api.abi.call({
    target: pTarget,
    params: pParam,
    abi: 'erc20:balanceOf',
    block: pChainBlocks.arbitrum,
    chain: 'arbitrum'
  });
  return result.output;
}

module.exports = {
    arbitrum:{
        tvl,
    },
  tvl
};