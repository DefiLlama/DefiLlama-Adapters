  const sdk = require('@defillama/sdk');
  const _ = require('underscore');
  const BigNumber = require('bignumber.js');
  const abi = require('./abi.json');
  const eTokenAbi = require('./eTokenAbi.json');
  const oracleAbi = require('./oracleAbi.json');
  const stakingAbi = require('./stakingAbi.json');
  const babyRouterAbi = require('./babyRouterAbi.json');
  const {toUSDTBalances, usdtAddress} = require('../helper/balances');
  const { compoundExports } = require('../helper/compound');
  const BASE = BigNumber(10 ** 18);
  const Double = BASE * BASE;

let oracles = {
  "bsc": "0xB5b00725D3a8edBe880416580587B9d66283404b",
}

let allControllers = {
  "bsc": ["0xfD1f241ba25b8966a14865cB22a4Ea3D24c92451"], // ESG unitroller 
}

let EsgStaking = {
  "bsc": "0x55839fe60742c7789DaBcA85Fd693f1cAbaeDd69", // ESG staking contract  
}

let EsgToken = {
   "bsc": "0x0985205D53D575CB07Dd4Fba216034dc614eab55", // ESG Token
}

let BabySwapRouter = {
   "bsc": "0x325E343f1dE602396E256B67eFd1F61C3A6B38Bd", // Router
}

let USDT = {
   "bsc": "0x55d398326f99059fF775485246999027B3197955", // USDT in BSC
}
/*==================================================
  TVL
  ==================================================*/

async function getESGStakingValue(chain, block) {
  const { output: totalStaked}  = await sdk.api.abi.call({
    block,
    target: EsgStaking[chain],
    abi: stakingAbi['total_deposited'],
    chain: chain 
  });

  const { output: esgPrice }  = await sdk.api.abi.call({
    block,
    target: BabySwapRouter[chain],
    abi: babyRouterAbi['getAmountsOut'],
    params: [BASE.toString(),[EsgToken[chain], USDT[chain]]],
    chain: chain
  });

  let stakedValue = BigNumber(totalStaked.toString()).times(BigNumber(esgPrice[1].toString())).div(Double);

  return stakedValue;
}

async function getTVLByTotalSupply(chain, token, block) {
  let balances = {}
  let tvl = BigNumber("0");

  let { output: asset} = await sdk.api.abi.call({
    block,
    target: token,
    abi: eTokenAbi['underlying'],
    chain: chain
  });

  let { output: decimals} = await sdk.api.abi.call({
    block,
    target: asset,
    abi: 'erc20:decimals',
    chain: chain
  });

  let { output: assetTotalSupply } = await sdk.api.abi.call({
    block,
    target: token,
    abi: eTokenAbi['totalSupply'],
    chain: chain
  });

  let { output: exchangeRate} = await sdk.api.abi.call({
    block,
    target: token,
    abi: eTokenAbi['exchangeRateCurrent'],
    chain: chain
  });

  let assetPrice = await getUnderlyingPrice(chain, token, block);

  tvl = tvl.plus(BigNumber(assetTotalSupply).times(BigNumber(exchangeRate)).times(BigNumber(assetPrice)).div(Double).div(BASE));
  let convertedBalance = BigNumber(assetTotalSupply);

  return {
    convertedBalance,
    tvl
  }
}

async function getAllMarketsByChain(chain, block) {
  const markets = await Promise.all(
    allControllers[chain].map(async controller => {return (await
      sdk.api.abi.call({
        block,
        target: controller,
        abi: abi['getAllMarkets'],
        chain: chain
      })).output;
    }));

  return markets.flat();
}

async function getUnderlyingPrice(chain, token, block) {
  const { output: eTokenPrices }  = await sdk.api.abi.call({
    block,
    target: oracles[chain],
    params: token,
    abi: oracleAbi['getUnderlyingPrice'],
    chain: chain
  });

  return eTokenPrices;
}

async function getTVLOfeToken(chain, block) {
  let eTokenBalances = {};
  let eTokenTVL = BigNumber("0");
  let eTokens = await getAllMarketsByChain(chain, block);

  await (
    Promise.all(eTokens.map(async (eToken) => {
      let {
	      convertedBalance: convertedBalance,
	      tvl: tvl 
      } = await getTVLByTotalSupply(chain, eToken, block);
      eTokenTVL = eTokenTVL.plus(tvl);
    }))
  );

  return eTokenTVL
}

async function getTVLByChain(chain, block) {
  let balances = {};
  let tvl = BigNumber("0");
  tvl = tvl.plus(await getESGStakingValue(chain, block));

  let eTokenTVL = await getTVLOfeToken(chain, block);
  tvl = tvl.plus(BigNumber(eTokenTVL));
  return tvl.toNumber();
}

async function bsc(timestamp, ethBlock, chainBlocks) {
  let tvl = await getTVLByChain('bsc', chainBlocks['bsc']);
  return toUSDTBalances(tvl);
}

async function staking(timestamp, ethBlock, chainBlocks) {
  let staked = await getESGStakingValue('bsc', chainBlocks['bsc']);
  return toUSDTBalances(staked);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of Total value locked in ESG protocol.',
  bsc: {
	  ...compoundExports('0xfd1f241ba25b8966a14865cb22a4ea3d24c92451', 'bsc'),
	  staking,
  },
  start: 15307794, // Feb-16-2022 01:49:31 PM +UTC
}
