  const sdk = require('@defillama/sdk');
  const _ = require('underscore');
  const BigNumber = require('bignumber.js');
  const abi = require('./abi.json');
  const BASE = BigNumber(10 ** 18)
  const Double = BASE * BASE;
  const {toUSDTBalances, usdtAddress} = require('../helper/balances')

let oracles = {
  "ethereum": "0x34BAf46eA5081e3E49c29fccd8671ccc51e61E79",
  "bsc": "0x7DC17576200590C4d0D8d46843c41f324da2046C",
}

let allControllers = {
  "ethereum": "0x8f1f15DCf4c70873fAF1707973f6029DEc4164b3",
  "bsc": "0x6d290f45A280A688Ff58d095de480364069af110",
}


async function getCurrentCash(chain, token, block) {
  let cash;
  const { output: isiToken } = await sdk.api.abi.call({
    block,
    target: token,
    abi: abi['isiToken'],
    chain: chain
  });

  if (isiToken) {
    const { output: iTokenTotalSupply } = await sdk.api.abi.call({
      block,
      target: token,
      abi: abi['totalSupply'],
      chain: chain
    });

    const { output: iTokenExchangeRate } = await sdk.api.abi.call({
      block,
      target: token,
      abi: abi['exchangeRateCurrent'],
      chain: chain
    });

    cash = BigNumber(iTokenTotalSupply).times(BigNumber(iTokenExchangeRate)).div(BigNumber(10 ** 18));
  } else {

    // Maybe need to accrue borrowed interests
    let { output: iMtokenSupply } = await sdk.api.abi.call({
      block,
      target: token,
      abi: abi['totalBorrows'],
      chain: chain
    });
    cash = BigNumber(iMtokenSupply);
  }
  return cash;
}

async function getAllMarketsByChain(chain, block) {
  const { output: markets } = await sdk.api.abi.call({
    block,
    target: allControllers[chain],
    abi: abi['getAlliTokens'],
    chain: chain
  });

  return markets;
}

async function getUnderlyingPrice(chain, token, block) {
  const { output: iTokenPrices }  = await sdk.api.abi.call({
    block,
    target: oracles[chain],
    params: token,
    abi: abi['getUnderlyingPrice'],
    chain: chain
  });

  return iTokenPrices;
}

async function getLendingTVLByChain(chain, block) {
  let iTokens = {};
  let lendingTVL = BigNumber("0");
  let markets = await getAllMarketsByChain(chain, block);

  await Promise.all(
    markets.map(async market => {
      let cash = await getCurrentCash(chain, market, block);
      let price = await getUnderlyingPrice(chain, market, block);

      iTokens[market] = cash;
      lendingTVL = lendingTVL.plus(cash.times(price).div(Double));
    })
  );

  return {iTokens, lendingTVL};
}

async function getTVLByChain(chain, block) {
  let balances = {};
  let tvl = BigNumber("0");

  // get balance and tvl of the lending protocol.
  let {
    iTokens: iTokensDetials,
    lendingTVL: lendingTVL
  } = await getLendingTVLByChain(chain, block);

  tvl = tvl.plus(lendingTVL);

  return toUSDTBalances(tvl.toNumber());
}

async function ethereum(timestamp, ethBlock, chainBlocks) {
  return getTVLByChain('ethereum', ethBlock);
}

async function bsc(timestamp, ethBlock, chainBlocks) {
  return getTVLByChain('bsc', chainBlocks['bsc']);
}

module.exports = {
  ethereum:{
    tvl: ethereum
  },
  bsc: {
    tvl: bsc
  },
  start: 1629776276, // Aug-24-2021 11:37:56 AM +UTC
  tvl: sdk.util.sumChainTvls([ethereum, bsc])
}
