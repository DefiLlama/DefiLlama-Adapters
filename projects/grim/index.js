const utils = require('../helper/utils');
const {toUSDTBalances} = require('../helper/balances')

async function fantom() {
  const response = await utils.fetchURL('https://api.grim.finance/tvl');

  let tvl = 0;
  for (const chainId in response.data) {
    const chain = response.data[chainId];

    for (const vault in chain) {
      tvl += chain[vault];
    }
  }
  if(tvl === 0){
    throw new Error("TVL for grim finance cannot be 0")
  }

  return toUSDTBalances(tvl);
}

async function polygon() {
  const response = await utils.fetchURL('https://api.grim.finance/tvl');

  let tvl = 0;
  
    const chain = response.data[137];

    for (const vault in chain) {
      tvl += chain[vault];
    }
  
  if(tvl === 0){
    throw new Error("TVL for grim finance cannot be 0")
  }

  return toUSDTBalances(tvl);
}

async function kava() {
  const response = await utils.fetchURL('https://api.grim.finance/tvl');

  let tvl = 0;
  
    const chain = response.data[2222];

    for (const vault in chain) {
      tvl += chain[vault];
    }
  
  if(tvl === 0){
    throw new Error("TVL for grim finance cannot be 0")
  }

  return toUSDTBalances(tvl);
}

async function arbitrum() {
  const response = await utils.fetchURL('https://api.grim.finance/tvl');

  let tvl = 0;
  
    const chain = response.data[42161];

    for (const vault in chain) {
      tvl += chain[vault];
    }
  
  if(tvl === 0){
    throw new Error("TVL for grim finance cannot be 0")
  }

  return toUSDTBalances(tvl);
}

async function avax() {
  const response = await utils.fetchURL('https://api.grim.finance/tvl');

  let tvl = 0;
  
    const chain = response.data[43114];

    for (const vault in chain) {
      tvl += chain[vault];
    }
  
  if(tvl === 0){
    throw new Error("TVL for grim finance cannot be 0")
  }

  return toUSDTBalances(tvl);
}

module.exports = {
  misrepresentedTokens: true,
  hallmarks: [
    [1639785600, "Reentrancy attack"]
],
  timetravel: false,
  methodology: 'TVL data is pulled from the Grim Finance API "https://api.grim.finance/tvl".',
  fantom: {
    tvl: fantom
  },
  polygon: {
    tvl: polygon
  },
  kava: {
    tvl: kava
  },
  arbitrum: {
    tvl: arbitrum
  },
  avax: {
    tvl: avax
  },
}
