const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');
const { GraphQLClient, gql } = require('graphql-request');
const { getBlock } = require('../helper/getBlock');
const { addFundsInMasterChef } = require('../helper/masterchef');

// const endpoints = {
//   bsc: 'https://api.thegraph.com/subgraphs/name/mochiswapdev/mochiswap3',
//   harmony: 'https://api.mochiswap.io/subgraphs/name/mochiswap/mochiswap1',
// }

// const graphQuery = gql`
// query get_tvl($block: Int) {
//   uniswapFactories(
//     first: 1,
//     block: { number: $block }
//   ) {
//     totalLiquidityUSD
//   },
// }
// `;

// async function getChainTvl(chain, block) {
//   const graphQLClient = new GraphQLClient(endpoints[chain]);
//   const results = await graphQLClient.request(graphQuery, { block });

//   return toUSDTBalances(results.uniswapFactories[0].totalLiquidityUSD);
// }

// async function bsc(timestamp, block, chainBlocks) {
//   return getChainTvl('bsc', chainBlocks['bsc']-5);
// }

// async function harmony(timestamp, block, chainBlocks) {
//   return getChainTvl('harmony', await getBlock(timestamp, 'harmony', chainBlocks)-5);
// }

const bscMochi = "0x055daB90880613a556a5ae2903B2682f8A5b8d27";
const bscBMochi = "0x2d0e75b683e8b56243b429b24f2b08bcc1ffd8da";
const bscChef = "0x464F1A30e5A5b5b2D3c5f4F0e823e01EeFE304df";
const chefPoolInfo = {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"poolInfo","outputs":[{"internalType":"contract IBEP20","name":"lpToken","type":"address"},{"internalType":"uint256","name":"allocPoint","type":"uint256"},{"internalType":"uint256","name":"lastRewardBlock","type":"uint256"},{"internalType":"uint256","name":"accMochiPerShare","type":"uint256"}],"stateMutability":"view","type":"function"};


async function bscTvl(timestamp, block, chainBlocks) {
  let balances = {};
  await addFundsInMasterChef(balances, bscChef, chainBlocks.bsc, "bsc", addr=> {
    if (addr.toLowerCase() === "0x2d0e75b683e8b56243b429b24f2b08bcc1ffd8da") {
      return `bsc:${bscMochi}`
    }
    else if (addr === "0x2859e4544c4bb03966803b044a93563bd2d0dd4d") {
      return "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce"
    }
    return `bsc:${addr}`
  }, chefPoolInfo, [bscMochi, bscBMochi]);
  return balances;
}

async function bscStaking(timestamp, block, chainBlocks) {
  let balances = {};
  let balance = (await sdk.api.erc20.balanceOf({
    target: bscBMochi,
    owner: bscChef,
    block: chainBlocks.bsc,
    chain: "bsc"
  })).output;
  sdk.util.sumSingleBalance(balances, `bsc:${bscMochi}`, balance);
  return balances;
}

const harmonyHMochi = "0x0dd740db89b9fda3baadf7396ddad702b6e8d6f5";
const harmonyStakingToken = "0x691f37653f2fbed9063febb1a7f54bc5c40bed8c";
const harmonyChef = "0xd0cb3e55449646c9735d53e83eea5eb7e97a52dc";

async function harmonyTvl(timestamp, block, chainBlocks) {
  let balances = {};
  await addFundsInMasterChef(balances, harmonyChef, chainBlocks.harmony, "harmony", addr=>{
    if (addr.toLowerCase() === "0x691f37653f2fbed9063febb1a7f54bc5c40bed8c" || addr.toLowerCase() === "0x865b568f24f0a17dba3e358b24b0c35659b1f25a") {
      return `harmony:${harmonyHMochi}`
    }
    return `harmony:${addr}`
  }, chefPoolInfo, [harmonyHMochi, harmonyStakingToken]);
  return balances;
}

async function harmonyStaking(timestamp, block, chainBlocks) {
  let balances = {};
  let balance = (await sdk.api.erc20.balanceOf({
    target: harmonyStakingToken,
    owner: harmonyChef,
    block: chainBlocks.harmony,
    chain: "harmony"
  })).output;
  sdk.util.sumSingleBalance(balances, `harmony:${harmonyHMochi}`, balance);
  return balances;
}


module.exports = {
  bsc: {
    tvl: bscTvl,
    staking: bscStaking
  },
  harmony: {
    tvl: harmonyTvl,
    staking: harmonyStaking
  },
  tvl: sdk.util.sumChainTvls([bscTvl, harmonyTvl])
  
}
