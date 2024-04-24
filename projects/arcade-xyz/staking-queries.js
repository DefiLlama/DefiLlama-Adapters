const sdk = require("@defillama/sdk");
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs');
const { getChainTransform } = require('../helper/portedTokens');

const { CHAIN, STAKING_REWARDS, SINGLE_SIDED_STAKING, ARCD, ARCD_WETH_LP } = require('./constants');
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

async function addToTVL(block, chainBlocks) {
  const balances = {};

  const transformAddress = await getChainTransform(CHAIN);

  // handle LP token unwrapping and add the total supply
  // for STAKING_REWARDS to balances
  await sumTokensAndLPsSharedOwners(
    balances,
    [[ARCD_WETH_LP, true]],
    [STAKING_REWARDS],
    block,
    CHAIN,
    transformAddress
  );

  // get the STAKING_REWARDS ARCD balance
  const stakingRewardsARCDbalance = await getBalanceOf(ARCD, STAKING_REWARDS, ARCD_ABI, block);
  // and add it to the balances
  sdk.util.sumSingleBalance(balances, 'coingecko:arcade-protocol', stakingRewardsARCDbalance);

  // get the SINGLE_SIDED_STAKING total supply
  const totalSupplySingleSided = await getTotalSupply(SINGLE_SIDED_STAKING, SINGLE_SIDED_STAKING_ABI, block);
  // add it to the balances
  sdk.util.sumSingleBalance(balances, 'coingecko:arcade-protocol', totalSupplySingleSided);

  // get the ARCD reserves from the UniswapV2 ARCD/wETH pair pool
  const pairPoolARCDbalance = await getReserves(ARCD_WETH_LP, LP_PAIR_ABI, block);
  // add it to the balances
  sdk.util.sumSingleBalance(balances, 'coingecko:arcade-protocol', pairPoolARCDbalance);

  return balances;
}

async function stakingTvl(timestamp, block, chainBlocks) {
  return await addToTVL(block, chainBlocks);
}

module.exports = {
  stakingTvl
};