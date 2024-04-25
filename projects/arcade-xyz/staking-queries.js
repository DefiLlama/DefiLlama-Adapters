const sdk = require("@defillama/sdk");

const { CHAIN, STAKING_REWARDS, SINGLE_SIDED_STAKING, ARCD, ARCD_WETH_LP, ARCD_COINID } = require('./constants');
const { SINGLE_SIDED_STAKING_ABI, ARCD_ABI, LP_PAIR_ABI } = require("./abi.js");

async function getTotalSupply(contractAddress, contractAbi, block) {
  const totalSupply = (
    await sdk.api.abi.call({
      target: contractAddress,
      abi: contractAbi.find((fn) => fn.name === "totalSupply"),
      chain: CHAIN,
      block: block,
    })
  ).output;

  return totalSupply;
}

async function getBalanceOf(tokenAddress, holderAddress, abi, block) {
  const balanceOf = (await sdk.api.abi.call({
    target: tokenAddress,
    abi: abi.find((fn) => fn.name === "balanceOf"),
    params: [holderAddress],
    block: block,
  })).output;

  return balanceOf;
}

async function getReserves(contractAddress, contractAbi, block) {
  const getReserve = (await sdk.api.abi.call({
    target: contractAddress,
    abi: contractAbi.find((fn) => fn.name === "getReserves"),
    block: block,
  })).output;

  return getReserve[1];
}

async function addToTVL(block) {
  const balances = {};

  // get the STAKING_REWARDS ARCD balance
  const stakingRewardsARCDbalance = await getBalanceOf(ARCD, STAKING_REWARDS, ARCD_ABI, block) / 1e18;
  // and add it to the balances
  sdk.util.sumSingleBalance(balances, ARCD_COINID, stakingRewardsARCDbalance);

  // get the SINGLE_SIDED_STAKING total supply
  const totalSupplySingleSided = await getTotalSupply(SINGLE_SIDED_STAKING, SINGLE_SIDED_STAKING_ABI, block) / 1e18;
  // add it to the balances
  sdk.util.sumSingleBalance(balances, ARCD_COINID, totalSupplySingleSided);

  return balances;
}

async function stakingTvl(timestamp, block) {
  return await addToTVL(block);
}

module.exports = {
  stakingTvl
};