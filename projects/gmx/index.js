const sdk = require('@defillama/sdk');
const {getBlock} = require('../helper/getBlock')
const axios = require("axios");
const retry = require('async-retry')
const { GraphQLClient, gql } = require('graphql-request')

const gmx = require('./GMX_ABI.json');
const erc20 = require('./ERC20_ABI.json');

const VAULT = '0x489ee077994B6658eAfA855C308275EAd8097C4A';
const GMX = '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a';
const WETH = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';
const WBTC = '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f';
const USDC = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8';

const ethWETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const ethWBTC = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
const ethUSDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

async function tvl(time, _ethBlock, chainBlocks) {
    const block = await getBlock(time, 'arbitrum', chainBlocks);
    let balances = {};

    const stakedGMX = await sdk.api.abi.call({
        target: GMX,
        abi: gmx['totalStaked'],
        block: block,
        chain: 'arbitrum'
      });
    const vaultWETH = await sdk.api.abi.call({
        target: WETH,
        params: [VAULT],
        abi: erc20['balanceOf'],
        block: block,
        chain: 'arbitrum'
    });
    const vaultWBTC = await sdk.api.abi.call({
        target: WBTC,
        params: VAULT,
        abi: erc20['balanceOf'],
        block: block,
        chain: 'arbitrum'
    });
    const vaultUSDC = await sdk.api.abi.call({
        target: USDC,
        params: VAULT,
        abi: erc20['balanceOf'],
        block: block,
        chain: 'arbitrum'
    });
    
    balances[GMX] = stakedGMX.output
    balances[WETH] = vaultWETH.output
    balances[WBTC] = vaultWBTC.output
    balances[USDC] = vaultUSDC.output
    
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

async function getPriceCoingecko(pIds) {
    let response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=' + pIds + '&vs_currencies=usd');
    return response.data[pIds].usd;
}

async function convertBalances(pBalances) {
    let balances = {};
    balances[ethWETH] = pBalances[WETH];
    balances[ethWBTC] = pBalances[WBTC];
    balances[ethUSDC] = pBalances[USDC];
    
    /* let tvl = 0;
    tvl += pBalances[WETH] * Math.pow(10, -18) * await getPriceCoingecko('weth');
    tvl += pBalances[WBTC] * Math.pow(10, -8) * await getPriceCoingecko('wrapped-bitcoin');
    tvl += pBalances[USDC] * Math.pow(10, -6) * await getPriceCoingecko('usd-coin');
    balances['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'] = tvl * Math.pow(10, 6); */

    return balances;
}

module.exports = {
  tvl
}