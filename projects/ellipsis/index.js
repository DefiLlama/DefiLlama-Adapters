const sdk = require("@defillama/sdk");
const axios = require('axios');
const { unwrapUniswapLPs } = require('../helper/unwrapLPs');
const abi = require('./abi.json');


function getBSCAddress(address) {
  return `bsc:${address}`
}

// list of missing tokens
const replaceable = {
  "0x049d68029688eAbF473097a2fC38ef61633A3C7A": "0xdac17f958d2ee523a2206206994597c13d831ec7", //fUSDT -> USDT
  '0xeD28A457A5A76596ac48d87C0f577020F6Ea1c4C': '0x5228a22e72ccc52d415ecfd199f99d0665e7733b', //pBTC -> pBTC on ETH
  '0x54261774905f3e6E9718f2ABb10ed6555cae308a': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', //anyBTC -> WBTC
  '0x03ab98f5dc94996f8c33e15cd4468794d12d41f9': '0x674c6ad92fd080e4004b2312b45f796a192d27a0', //USDN -> USDN on ETH
};

const endpoint = 'https://api.ellipsis.finance/api/getPools'

const epsPool = '0x4076CC26EFeE47825917D0feC3A79d0bB9a6bB5c';
const epsContract = '0xa7f552078dcc247c2684336020c03648500c6d9f';
const epsBnbLP = '0xf9045866e7b372def1eff3712ce55fac1a98daf0';


async function tvl(timestamp, block, chainBlocks) {

  let balances = {};

  let allPools = (await axios.get(endpoint)).data.data
  const basePools = allPools.basePools
  const metaPools = allPools.metaPools

  await Promise.all(basePools.map(async (element) => {

    await Promise.all(element.tokens.map(async (token) => {
      const balance = await sdk.api.abi.call({
        abi: abi.balancesBasePool,
        target: element.address,
        params: token.index,
        block: chainBlocks['bsc'],
        chain: 'bsc'
      });
      balances[getBSCAddress(token.erc20address)] = balance.output
    }));
  }));

  await Promise.all(metaPools.map(async (element) => {

    const balance = await sdk.api.abi.call({
      abi: abi.balancesMetaPool,
      target: element.address,
      params: 0,
      block: chainBlocks['bsc'],
      chain: 'bsc'
    });
    if (Object.keys(replaceable).includes(element.token.address)) {
      sdk.util.sumSingleBalance(balances, replaceable[element.token.address], balance.output)
    } else {
      balances[getBSCAddress(element.token.address)] = balance.output
    }
  }));
  return balances;
}


async function pool2(timestamp, block, chainBlocks) {
  let balances = {}

  //Staked and locked EPS
  const staked = await sdk.api.abi.call({
    abi: abi.totalSupply,
    target: epsPool,
    block: chainBlocks['bsc'],
    chain: 'bsc'
  });
  const locked = await sdk.api.abi.call({
    abi: abi.lockedSupply,
    target: epsPool,
    block: chainBlocks['bsc'],
    chain: 'bsc'
  });
  const epsStakedTotal = parseInt(staked.output) + parseInt(locked.output);

  balances[getBSCAddress(epsContract)] = + epsStakedTotal;
  return balances
}

async function staking(timestamp, block, chainBlocks) {
  let balances = {}

  //EPS/BNB LP
  const transformAdress = addr=>'bsc:'+addr;

  const lpBalance = await sdk.api.abi.call({
    abi: abi.totalSupplyLP,
    target: epsBnbLP,
    block: chainBlocks['bsc'],
    chain: 'bsc'
  });

  await unwrapUniswapLPs(
    balances,
    [{
      token: epsBnbLP,
      balance: parseInt(lpBalance.output),
    }],
    chainBlocks['bsc'],
    'bsc',
    transformAdress
  );

  return balances
}


module.exports = {
  methodology: "pool2 is where eps is and eps/bnb staked. ffUSDT and anyBTC has been replaced with USDT and WBTC in the TVL calculation respectively",
  bsc: {
    tvl
  },
  tvl,
  pool2: {
    tvl: pool2
  },
  staking: {
    tvl: staking
  }
};
