const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const ethers = require('ethers');
const managedPortfolioFactoryAbi = require('./managedPortfolioFactoryAbi.json');
const managedPortfolioAbi = require('./managedPortfolioAbi.json');


const tfBUSD = '0x1Ed460D149D48FA7d91703bf4890F97220C09437';
const tfTUSD = '0xa1e72267084192db7387c8cc1328fade470e4149';
const tfUSDC = '0xA991356d261fbaF194463aF6DF8f0464F8f1c742';
const tfUSDT = '0x6002b1dcB26E7B1AA797A17551C6F487923299d7';
const stkTRU = '0x23696914Ca9737466D8553a2d619948f548Ee424';
const TRU = '0x4C19596f5aAfF459fA38B0f7eD92F11AE6543784';
const BUSD = '0x4Fabb145d64652a948d72533023f6E7A623C7C53';
const TUSD = '0x0000000000085d4780B73119b644AE5ecd22b376';
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const managedPortfolioFactory = '0x17b7b75FD4288197cFd99D20e13B0dD9da1FF3E7';

async function getTvlForManagedPortfolios(block) {
  if (block < 14043986) {
    return {}
  }
  const portfolios = (await sdk.api.abi.call({
      target: managedPortfolioFactory,
      abi: managedPortfolioFactoryAbi['getPortfolios'],
      block
    })).output;
  const portfoliosBalances = {};
  for (let i = 0; i < portfolios.length; i++) {
    const value = (await sdk.api.abi.call({
      target: portfolios[i],
      abi: managedPortfolioAbi['value'],
      block
    })).output;
    const underlyingToken = (await sdk.api.abi.call({
      target: portfolios[i],
      abi: managedPortfolioAbi['underlyingToken'],
      block
    })).output;

    if (!portfoliosBalances[underlyingToken]) {
      portfoliosBalances[underlyingToken] = [];
    }
    portfoliosBalances[underlyingToken].push(value);
  }
  let balances = {}
  const underlyingTokens = Object.keys(portfoliosBalances);
  for (let i = 0; i < underlyingTokens.length; i++) {
    balances[underlyingTokens[i]] = portfoliosBalances[underlyingTokens[i]].reduce((acc, curr) => acc.add(curr), ethers.BigNumber.from(0))
  }
  return balances;
}

async function tvl(timestamp, block) {
    let balances = {};

    const tfbusdTVL = await sdk.api.abi.call({
      target: tfBUSD,
      abi: abi['poolValue'],
      block: block
    });
    const tftusdTVL = await sdk.api.abi.call({
      target: tfTUSD,
      abi: abi['poolValue'],
      block: block
    });
    const tfusdcTVL = await sdk.api.abi.call({
      target: tfUSDC,
      abi: abi['poolValue'],
      block: block
    });
    const tfusdtTVL = await sdk.api.abi.call({
      target: tfUSDT,
      abi: abi['poolValue'],
      block: block
    });
    const truTVL = await sdk.api.abi.call({
      target: stkTRU,
      abi: abi['stakeSupply'],
      block: block 
    });
    
    balances[BUSD] = tfbusdTVL.output;
    balances[TUSD] = tftusdTVL.output;
    balances[USDC] = tfusdcTVL.output;
    balances[USDT] = tfusdtTVL.output;
    balances[TRU] = truTVL.output;

    const managedPortfoliosBalances = await getTvlForManagedPortfolios(block)
    Object.keys(managedPortfoliosBalances).map(token => balances[token] = managedPortfoliosBalances[token].add(balances[token]).toString())

    return balances;
}



module.exports = {
  start: 1605830400,            // 11/20/2020 @ 12:00am (UTC)
  tvl                           // tvl adapter
}