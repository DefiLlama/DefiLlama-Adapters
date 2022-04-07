const sdk = require('@defillama/sdk');
const fetch = require('node-fetch');
const BigNumber = require("bignumber.js");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const BRIDGE_CONTROLLER = '0x0Dd4A86077dC53D5e4eAE6332CB3C5576Da51281';
const TOKEN ='0xC17c30e98541188614dF99239cABD40280810cA3';
const NFTSTAKES = '0x23cD2E6b283754Fd2340a75732f9DdBb5d11807e';
const STAKE_HOLDING_API = 'https://app.everrise.com/bridge/api/v1/stats'

const ethPool2LPs = [
  {
    owner: "0x33280d3a65b96eb878dd711abe9b2c0dbf740579",
    pool: "0x7250f7e97a4338d2bd72abc4b010d7a8477dc1f9",
  }, // RISE-ETH
];
const bscPool2LPs = [
  {
    owner: "0x89dd305ffbd8e684c77758288c48cdf4f4abe0f4",
    pool: "0x10dA269F5808f934326D3Dd1E04B7E7Ca78bb804",
  }, // RISE-BNB
];
const polygonPool2LPs = [
  {
    owner: "0x33280d3a65b96eb878dd711abe9b2c0dbf740579",
    pool: "0xf3c62dbbfec92a2e73d676d62ebec06a6bc224e2",
  }, // RISE-MATIC
];
const avaxPool2LPs = [
  {
    owner: "0x33280d3a65b96eb878dd711abe9b2c0dbf740579",
    pool: "0x5472e98d22b0fb7ec5c3e360788b8700419370b5",
  }, // RISE-AVAX
];
const fantomPool2LPs = [
  {
    owner: "0x33280d3a65b96eb878dd711abe9b2c0dbf740579",
    pool: "0xde62a6cdd8d5a3988495317cffac9f3fed299383",
  }, // RISE-FTM
];

function bscTvl(timestamp, block) {
  return tvl(timestamp, block, 'bsc');
}

function polygonTvl(timestamp, block) {
  return tvl(timestamp, block, 'polygon');
}

function avalancheTvl(timestamp, block) {
  return tvl(timestamp, block, 'avax');
}

function fantomTvl(timestamp, block) {
  return tvl(timestamp, block, 'fantom');
}

async function ethStaking(timestamp, block) {
  let balances = {};
  balances[TOKEN] = await staking(timestamp, block, '1', undefined, TOKEN);
  return balances;
}

async function bscStaking(timestamp, block) {
  let balances = {};
  balances['bsc:' + TOKEN] = await staking(timestamp, block, '56', 'bsc', TOKEN);
  return balances;
}

async function polygonStaking(timestamp, block) {
  let balances = {};
  balances['polygon:' + TOKEN] = await staking(timestamp, block, '137', 'polygon', TOKEN);
  return balances;
}

async function fantomStaking(timestamp, block) {
  let balances = {};
  balances['fantom:' + TOKEN] = await staking(timestamp, block, '250', 'fantom', TOKEN);
  return balances;
}

async function avalancheStaking(timestamp, block) {
  let balances = {};
  balances['avax:' + TOKEN] = await staking(timestamp, block, '43114', 'avax', TOKEN);
  return balances;
}

function coin(chain){
  switch (chain){
    case 'bsc':
      return 'binancecoin';
    case 'polygon':
      return 'matic-network';
    case 'avax':
      return 'avalanche-2';
    case 'fantom':
      return 'fantom';
  }
}

const START_BLOCKS =
{
    "1": 14501731,
    "56": 16572075,
    "137": 26624236,
    "250": 34977434,
    "43114": 12864176,
}

async function staking(timestamp, block, chainId, chain, token) {
    /*
    var logsPromises = await Promise.all([
        sdk.api.util.getLogs({
            keys: [],
            toBlock: 'latest',
            target: TOKEN,
            fromBlock: START_BLOCKS[chainId],
            topic: 'StakingIncreased(address,uint256,uint8)',
            chain: chain
        }),
        sdk.api.util.getLogs({
            keys: [],
            toBlock: 'latest',
            target: TOKEN,
            fromBlock: START_BLOCKS[chainId],
            topic: 'StakingDecreased(address,uint256)',
            chain: chain
        })
    ]);

    const increaseLogs = logsPromises[0].output;
    const decreaseLogs = logsPromises[1].output;

    const stakedAmount = new BigNumber(0);

    for (let log of increaseLogs) {
        stakedAmount.plus(`0x${log.data.substr(-64)}`.toLowerCase());
    }
    for (let log of decreaseLogs) {
        stakedAmount.minus(`0x${log.data.substr(-64)}`.toLowerCase());
    }

    return stakedAmount;
    */

    const stakedAmounts = await ((await fetch(STAKE_HOLDING_API)).json());

    let stakedAmount = 0;
    for (let i = 0, ul = stakedAmounts.length; i < ul; i++) {
       if (stakedAmounts[i].id === chainId) {
          stakedAmount = BigNumber(stakedAmounts[i].amount).multipliedBy(BigNumber(10).pow(18));
       }
    }

    return stakedAmount;
}

async function tvl(timestamp, block, chain) {
    let balances = {};

    const results = (await sdk.api.eth.getBalances({
      targets: [TOKEN, BRIDGE_CONTROLLER],
      chain: chain
    }));

    let total = BigNumber(0);
    for (const c of results.output) {
      total = total.plus(BigNumber(c.balance));
    }

    balances[coin(chain)] = total.div(BigNumber(10).pow(18));
    
    return balances;
}

async function ethTvl(timestamp, block) {
  let balances = {};

  const results = (await sdk.api.eth.getBalances({
    targets: [TOKEN, BRIDGE_CONTROLLER]
  }));

  let total = BigNumber(0);
  for (const c of results.output) {
    total = total.plus(BigNumber(c.balance));
  }

  balances['ethereum'] = total.div(BigNumber(10).pow(18));
  
  return balances;
}

function mergeBalances(balances, balancesToMerge) {
    Object.entries(balancesToMerge).forEach(balance => {
        sdk.util.sumSingleBalance(balances, balance[0], balance[1].toNumber())
    })
}

async function pool2(balances, chainBlocks, chain, pool) {
  let lpPositions = [];
  let lpBalances = (
    await sdk.api.abi.multiCall({
      calls: pool.map((p) => ({
        target: p.pool,
        params: p.owner,
      })),
      abi: "erc20:balanceOf",
      block: chainBlocks[chain],
      chain: chain
    })
  ).output;
  lpBalances.forEach((i) => {
    lpPositions.push({
      balance: i.output,
      token: i.input.target,
    });
  });
  await unwrapUniswapLPs(balances, lpPositions, chainBlocks[chain], chain, addr=>`${chain}:${addr}`);
  return balances;
}

async function ethPool2(timestamp, block) {
  let balances = {};
  await pool2(balances, block, "ethereum", ethPool2LPs);
  return balances;
}

async function bscPool2(timestamp, block) {
  let balances = {};
  await pool2(balances, block, "bsc", bscPool2LPs);
  return balances;
}

async function polygonPool2(timestamp, block) {
  let balances = {};
  await pool2(balances, block, "polygon", polygonPool2LPs);
  return balances;
}

async function avaxPool2(timestamp, block) {
  let balances = {};
  await pool2(balances, block, "avax", avaxPool2LPs);
  return balances;
}

async function fantomPool2(timestamp, block) {
  let balances = {};
  await pool2(balances, block, "fantom", fantomPool2LPs);
  return balances;
}

async function totalTvl(timestamp, block, chainBlocks) {
    const balances = {}
    await Promise.all([
        ethTvl(timestamp, block, chainBlocks),
        bscTvl(timestamp, block, chainBlocks),
        polygonTvl(timestamp, block, chainBlocks),
        avalancheTvl(timestamp, block, chainBlocks),
        fantomTvl(timestamp, block, chainBlocks),
    ]).then(poolBalances => poolBalances.forEach(pool => mergeBalances(balances, pool)))
    return balances
}

async function totalPool2(timestamp, block, chainBlocks) {
    const balances = {}
    await Promise.all([
      ethPool2(timestamp, block, chainBlocks),
      bscPool2(timestamp, block, chainBlocks),
      polygonPool2(timestamp, block, chainBlocks),
      avaxPool2(timestamp, block, chainBlocks),
      fantomPool2(timestamp, block, chainBlocks),
    ]).then(poolBalances => poolBalances.forEach(pool => mergeBalances(balances, pool)))
    return balances
}

async function totalStaking(timestamp, block, chainBlocks) {
    const balances = {}
    await Promise.all([
      ethStaking(timestamp, block, chainBlocks),
      bscStaking(timestamp, block, chainBlocks),
      polygonStaking(timestamp, block, chainBlocks),
      avalancheStaking(timestamp, block, chainBlocks),
      fantomStaking(timestamp, block, chainBlocks),
    ]).then(poolBalances => poolBalances.forEach(pool => mergeBalances(balances, pool)))
    return balances
}

module.exports = {
  bsc:{
    tvl: bscTvl,
    staking: bscStaking,
    pool2: bscPool2,
  },
  ethereum:{
    tvl: ethTvl,
    staking: ethStaking,
    pool2: ethPool2,
  },
  polygon:{
    tvl: polygonTvl,
    staking: polygonStaking,
    pool2: polygonPool2,
  },
  fantom:{
    tvl: fantomTvl,
    staking: fantomStaking,
    pool2: fantomPool2,
  },
  avalanche:{
    tvl: avalancheTvl,
    staking: avalancheStaking,
    pool2: avaxPool2,
  },
  methodology: "TVL comes from the buyback reserves, other token migration vaults and cross-chain bridge vaults",
};