const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const BigNumber = require("bignumber.js");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const STATS ='0xC4DD716a29357317BdC66d9D9cF2ec02fD995742';
const BRIDGE_CONTROLLER = '0x0Dd4A86077dC53D5e4eAE6332CB3C5576Da51281';
const TOKEN ='0x0cD022ddE27169b20895e0e2B2B8A33B25e63579';
const TOKEN_AVAX ='0xC3A8d300333BFfE3ddF6166F2Bc84E6d38351BED';
const STAKING ='0x1490EaA0De0b2D4F9fE0E354A7D99d6C6532be84';

const ethPool2LPs = [
  {
    owner: "0xA366820f4781049E0f183697252bc6cbc4fcD9e1",
    pool: "0x9295c3289a0d924c0437436fa9fca5e34cb8acb3",
  }, // RISE-ETH
];
const bscPool2LPs = [
  {
    owner: "0xA366820f4781049E0f183697252bc6cbc4fcD9e1",
    pool: "0xe880A0be3513B92FFe3563D8ee9F6f7b954E4415",
  }, // RISE-ETH
];
const polygonPool2LPs = [
  {
    owner: "0xA366820f4781049E0f183697252bc6cbc4fcD9e1",
    pool: "0xb24A550E8E764CAE3fCe91c333B5B17CccfFf438",
  }, // RISE-ETH
];
const avaxPool2LPs = [
  {
    owner: "0xA366820f4781049E0f183697252bc6cbc4fcD9e1",
    pool: "0xB7395899318b2DF8EedeF9bBfe840bA99932aA13",
  }, // RISE-ETH
];
const fantomPool2LPs = [
  {
    owner: "0xA366820f4781049E0f183697252bc6cbc4fcD9e1",
    pool: "0x70d1894747aed5090539baDA0E9eD1A67D7e31d7",
  }, // RISE-ETH
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

function polygonStaking(timestamp, block) {
  return staking(timestamp, block, 'polygon', TOKEN);
}

function bscStaking(timestamp, block) {
  return staking(timestamp, block, 'bsc', TOKEN);
}

function avalancheStaking(timestamp, block) {
  return staking(timestamp, block, 'avax', TOKEN_AVAX);
}

function fantomStaking(timestamp, block) {
  return staking(timestamp, block, 'fantom', TOKEN);
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

async function staking(timestamp, block, chain, token) {
  let balances = {};

  const stats = (await sdk.api.abi.call({
    target: STATS,
    abi: abi['getStats'],
    block: block,
    chain: chain
  })).output;

  let staking = BigNumber(stats.staked)
                .minus(BigNumber(stats.rewards));

  const balance = (await sdk.api.erc20.balanceOf({
    target: token,
    owner: STAKING,
    block: block,
    chain: chain
  })).output;

  staking = staking.plus(BigNumber(balance));

  balances[chain+':'+token] = staking;
  
  return balances;
}

async function ethStaking(timestamp, block) {
  let balances = {};

  const stats = (await sdk.api.abi.call({
    target: STATS,
    abi: abi['getStats'],
    block: block
  })).output;

  let staking = BigNumber(stats.staked)
                .minus(BigNumber(stats.rewards));

  const balance = (await sdk.api.erc20.balanceOf({
    target: TOKEN,
    owner: STAKING
  })).output;

  staking = staking.plus(BigNumber(balance));

  balances[TOKEN] = staking;
  
  return balances;
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
  name: 'EverRise',
  token: 'RISE',
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
  tvl: totalTvl,
  staking: totalStaking,
  pool2: totalPool2,
  methodology: "TVL comes from the buyback reserves and cross-chain bridge vaults",
};