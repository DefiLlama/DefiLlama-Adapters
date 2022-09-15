const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const { getChainTransform } = require('../helper/portedTokens')
const { getBlock } = require('../helper/getBlock')
const { ADDRESSES } = require("./constants");

// gets balance of staking token held by the array of staking contract addresses.
async function addRewardsEscrowTVL(balances, timestamp, chainBlocks, chain = "ethereum", transformedRewardTokenAddress = undefined, decimals = undefined,) {
  const rewardsEscrowAddress = ADDRESSES[chain].rewardsEscrow
  const rewardToken = ADDRESSES[chain].pop
  const block = await getBlock(timestamp, chain, chainBlocks)
  let rewardsEscrowBalance = (await sdk.api.abi.call({
    abi: "erc20:balanceOf",
    target: rewardToken,
    params: [rewardsEscrowAddress],
    block,
    chain
  })).output

  let address = rewardToken;
  if (transformedRewardTokenAddress) {
    address = transformedRewardTokenAddress
  } else {
    address = (await getChainTransform(chain))(rewardToken)
  }
  if (decimals) {
    rewardsEscrowBalance = Number(rewardsEscrowBalance) / (10 ** decimals)
  }
  let coingeckoPopAddress = ADDRESSES.ethereum.pop
  sdk.util.sumSingleBalance(balances, coingeckoPopAddress, rewardsEscrowBalance)
}

module.exports = {
  addRewardsEscrowTVL
}