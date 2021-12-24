const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const BigNumber = require("bignumber.js");

const STATS ='0xC4DD716a29357317BdC66d9D9cF2ec02fD995742';
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
    owner: STAKING,
    block: block
  })).output;

  staking = staking.plus(BigNumber(balance));

  balances[TOKEN] = staking;
  
  return balances;
}

async function tvl(timestamp, block, chain) {
    let balances = {};

    const stats = (await sdk.api.abi.call({
      target: STATS,
      abi: abi['getStats'],
      block: block,
      chain: chain
    })).output;

    const tvlCoin = BigNumber(stats.reservesBalance).div(BigNumber(10).pow(BigNumber(stats.coinDecimals)));

    const tvlToken = BigNumber(stats.bridgeVault);

    balances[coin(chain)] = tvlCoin
    balances[chain+':'+TOKEN] = tvlToken;
    
    return balances;
}

async function ethTvl(timestamp, block) {
  let balances = {};

  const stats = (await sdk.api.abi.call({
    target: STATS,
    abi: abi['getStats'],
    block: block
  })).output;

  const tvlCoin = BigNumber(stats.reservesBalance).div(BigNumber(10).pow(BigNumber(stats.coinDecimals)));

  const tvlToken = BigNumber(stats.bridgeVault);

  balances['ethereum'] = tvlCoin
  balances[TOKEN] = tvlToken;
  
  return balances;
}

module.exports = {
  name: 'EverRise',
  token: 'RISE',
  bsc:{
    tvl: bscTvl,
    staking: bscStaking,
    start: 13428052,
  },
  ethereum:{
    tvl: ethTvl,
    staking: ethStaking,
    start: 13794318,
  },
  polygon:{
    tvl: polygonTvl,
    staking: polygonStaking,
    start: 22460297,
  },
  methodology: "TVL comes from the buyback reserves and cross-chain bridge vaults",
};