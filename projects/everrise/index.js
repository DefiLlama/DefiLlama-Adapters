const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const BigNumber = require("bignumber.js");

const STATS ='0xC4DD716a29357317BdC66d9D9cF2ec02fD995742';
const BRIDGE_CONTROLLER = '0x0Dd4A86077dC53D5e4eAE6332CB3C5576Da51281';
const TOKEN ='0x0cD022ddE27169b20895e0e2B2B8A33B25e63579';
const STAKING ='0x1490EaA0De0b2D4F9fE0E354A7D99d6C6532be84';

function bscTvl(timestamp, block) {
  return tvl(timestamp, block, 'bsc');
}

function polygonTvl(timestamp, block) {
  return tvl(timestamp, block, 'polygon');
}

function bscStaking(timestamp, block) {
  return staking(timestamp, block, 'bsc');
}

function polygonStaking(timestamp, block) {
  return staking(timestamp, block, 'polygon');
}

function coin(chain){
  switch (chain){
    case 'bsc':
      return 'binancecoin';
    case 'polygon':
      return 'matic-network';
  }
}

async function staking(timestamp, block, chain) {
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
    target: TOKEN,
    owner: STAKING,
    block: block,
    chain: chain
  })).output;

  staking = staking.plus(BigNumber(balance));

  balances[chain+':'+TOKEN] = staking;
  
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

module.exports = {
  name: 'EverRise',
  token: 'RISE',
  bsc:{
    tvl: bscTvl,
    staking: bscStaking
  },
  ethereum:{
    tvl: ethTvl,
    staking: ethStaking
  },
  polygon:{
    tvl: polygonTvl,
    staking: polygonStaking
  },
  methodology: "TVL comes from the buyback reserves and cross-chain bridge vaults",
};