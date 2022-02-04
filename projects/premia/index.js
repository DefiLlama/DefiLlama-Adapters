const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokens } = require("../helper/unwrapLPs");
const { stakings } = require("../helper/staking");
//const tvlV1 = require('./v1')


const PREMIA_OPTIONS_CONTRACT_ETH =
  "0x5920cb60B1c62dC69467bf7c6EDFcFb3f98548c0";
const PREMIA_OPTIONS_CONTRACT_BSC =
  "0x8172aAC30046F74907a6b77ff7fC867A6aD214e4";

const erc20DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const erc20BUSD = "0xe9e7cea3dedca5984780bafc599bd69add087d56";

const calcTvl = async (balances, chain, block, premiaOptionsContract) => {
  const erc20TokensLength = (
    await sdk.api.abi.call({
      abi: abi.tokensLength,
      target: premiaOptionsContract,
      block,
      ...(chain == "bsc" && { chain }),
    })
  ).output;

  for (let i = 0; i < erc20TokensLength; i++) {
    const erc20Tokens = (
      await sdk.api.abi.call({
        abi: abi.tokens,
        target: premiaOptionsContract,
        params: i,
        block,
        ...(chain == "bsc" && { chain }),
      })
    ).output;

    const erc20TokensBalance = (
      await sdk.api.erc20.balanceOf({
        target: erc20Tokens,
        owner: premiaOptionsContract,
        block,
        ...(chain == "bsc" && { chain }),
      })
    ).output;

    if (chain == "ethereum") {
      sdk.util.sumSingleBalance(balances, `${erc20Tokens}`, erc20TokensBalance);
    } else {
      sdk.util.sumSingleBalance(
        balances,
        `bsc:${erc20Tokens}`,
        erc20TokensBalance
      );
    }
  }
};

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await calcTvl(balances, "ethereum", ethBlock, PREMIA_OPTIONS_CONTRACT_ETH);

  const erc20DAIBalance = (
    await sdk.api.erc20.balanceOf({
      target: erc20DAI,
      owner: PREMIA_OPTIONS_CONTRACT_ETH,
      ethBlock,
    })
  ).output;
  sdk.util.sumSingleBalance(balances, erc20DAI, erc20DAIBalance);

  return balances;
};

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await calcTvl(
    balances,
    "bsc",
    chainBlocks["bsc"],
    PREMIA_OPTIONS_CONTRACT_BSC
  );

  const erc20BUSDBalance = (
    await sdk.api.erc20.balanceOf({
      target: erc20BUSD,
      owner: PREMIA_OPTIONS_CONTRACT_BSC,
      block: chainBlocks["bsc"],
      chain: "bsc",
    })
  ).output;

  sdk.util.sumSingleBalance(balances, `bsc:${erc20BUSD}`, erc20BUSDBalance);

  return balances;
};

const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f"
const ethTvlV2 = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const newPools = [
    ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x398D1622B10fE01f5F90a7bdA7A97eD4B54D6e28"],
    ["0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", "0xC88aE38Cc8dF85dA9de09F9C0f587249Cc98eE23"],
    ["0x514910771af9ca656af840dff83e8264ecf986ca", "0x26Bc47E2b076FC7EC68cB6D5824fac2047653246"],
    ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0xa4492fcDa2520cB68657d220f4D4aE3116359C10"],
    ["0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", "0x1B63334f7bfDf0D753AB3101EB6d02B278db8852"],
    ["0x514910771af9ca656af840dff83e8264ecf986ca", "0xFDD2FC2c73032AE1501eF4B19E499F2708F34657"]
  ]
  await sumTokens(balances, newPools.concat(newPools.map(pool=>[DAI, pool[1]])), ethBlock)

  return balances;
};


const arbTvlV2 = async (timestamp, ethBlock, chainBlocks) => {
  const arbDAI = "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"
  const balances = {};

  const newPools = [
    ["0x82af49447d8a07e3bd95bd0d56f35241523fbab1", "0xE5DbC4EDf467B609A063c7ea7fAb976C6b9BAa1a"],
    ["0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", "0xb5fE3bc2eF4c34cC233922dfF2Fcb1B1BF89A38E"],
    ["0xf97f4df75117a78c1a5a0dbb814af92458539fb4", "0xf87Ca9EB60c2E40A6C5Ab14ca291934a95F845Ff"],
  ]
  await sumTokens(balances, newPools.concat(newPools.map(pool=>[arbDAI, pool[1]])), chainBlocks.arbitrum, "arbitrum", addr=>`arbitrum:${addr}`)

  return balances;
};

module.exports = {
  ethereum: {
    tvl: sdk.util.sumChainTvls([ethTvlV2, ethTvl]),
    staking: stakings(["0x16f9d564df80376c61ac914205d3fdff7057d610", "0xF1bB87563A122211d40d393eBf1c633c330377F9"], "0x6399c842dd2be3de30bf99bc7d1bbf6fa3650e70")
  },
  bsc: {
    tvl: bscTvl,
  },
  arbitrum:{
    tvl: arbTvlV2
  }
};
