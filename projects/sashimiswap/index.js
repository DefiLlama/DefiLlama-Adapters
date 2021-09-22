const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const tvlOnPairs = require("../helper/processPairs.js");
const { getCompoundV2Tvl } = require("../helper/compound");
const {
  transformBscAddress,
  transformHecoAddress,
} = require("../helper/portedTokens");

const factoryETH = "0xF028F723ED1D0fE01cC59973C49298AA95c57472";
const comprollerETH = "0xB5d53eC97Bed54fe4c2b77f275025c3fc132D770";
const sIETH = "0xC597F86424EEb6599Ea40f999DBB739e3Aca5d82";
const WETHEquivalent = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const factoryBSC = "0x1DaeD74ed1dD7C9Dabbe51361ac90A69d851234D";
const comprollerBSC = "0x88fEf82FDf75E32e4BC0e662d67CfcEF4838F026";
const sIBNB = "0x6Df484F552115fa7F54bE4A6D7aE2999cadB2324";
const WBNBEquivalent = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

const factoryHECO = "0xC28E27870558cF22ADD83540d2126da2e4b464c2";
const comprollerHECO = "0x6Cb9d7ecf84b0d3E7704ed91046e16f9D45C00FA";
const sIHT = "0xf13d3E10DEE31b80887422c89285112Dd00ce0B5";
const WHTEquivalent = "0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f";

const staking = async (timestamp, ethBlock) => {
  const balances = {};

  const bal = (
    await sdk.api.abi.call({
      abi: erc20.balanceOf,
      target: "0xC28E27870558cF22ADD83540d2126da2e4b464c2",
      params: "0x6ed306DbA10E6c6B20BBa693892Fac21f3B91977",
      block: ethBlock,
    })
  ).output;

  sdk.util.sumSingleBalance(
    balances,
    "0xC28E27870558cF22ADD83540d2126da2e4b464c2",
    bal
  );

  return balances;
};

const ethMarketsTvl = async (...params) => {
  return getCompoundV2Tvl(
    comprollerETH,
    "ethereum",
    (addr) => addr,
    sIETH,
    WETHEquivalent
  )(...params);
};

const bscMarketsTvl = async (...params) => {
  const transformAdress = await transformBscAddress();
  return getCompoundV2Tvl(
    comprollerBSC,
    "bsc",
    transformAdress,
    sIBNB,
    WBNBEquivalent
  )(...params);
};

const hecoMarketsTvl = async (...params) => {
  const transformAdress = await transformHecoAddress();
  return getCompoundV2Tvl(
    comprollerHECO,
    "heco",
    transformAdress,
    sIHT,
    WHTEquivalent
  )(...params);
};

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await tvlOnPairs("ethereum", chainBlocks, factoryETH, balances);

  return balances;
};

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await tvlOnPairs("bsc", chainBlocks, factoryBSC, balances);

  return balances;
};

const hecoTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await tvlOnPairs("heco", chainBlocks, factoryHECO, balances);

  return balances;
};

module.exports = {
  staking: {
    tvl: staking,
  },
  ethereum: {
    tvl: sdk.util.sumChainTvls([ethTvl,ethMarketsTvl]),
    
  },
  bsc: {
    tvl: sdk.util.sumChainTvls([bscTvl,bscMarketsTvl]),
  },
  heco: {
    tvl:sdk.util.sumChainTvls([hecoTvl,hecoMarketsTvl]),
    
  },
  tvl: sdk.util.sumChainTvls([
    ethTvl,
    ethMarketsTvl,
    bscTvl,
    bscMarketsTvl,
    hecoTvl,
    hecoMarketsTvl,
  ]),
  methodology:
    "We count liquidity on the Farms (LP tokens) threw Factory Contract; and on the lending markets same as compound",
};
