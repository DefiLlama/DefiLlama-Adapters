const sdk = require("@defillama/sdk");
const { getBlock } = require("../helper/getBlock");
const arbiStakerERC20 = require("./abis/arbiStakerERC20.json");
const contracts = require("./contracts.json");
const { default: BigNumber } = require("bignumber.js");
const { getPrice } = require("./getPrice");

async function tvl(time, _ethBlock, chainBlocks) {
  const block = await getBlock(time, "arbitrum", chainBlocks);

  const nbOfPrograms = (
    await sdk.api.abi.call({
      block,
      target: contracts["arbiStaker"],
      abi: arbiStakerERC20["getNumTokensStaked"],
      chain: "arbitrum",
    })
  ).output;

  const stakingTokens = (
    await sdk.api.abi.multiCall({
      block,
      abi: arbiStakerERC20["getTokenStakedAt"],
      calls: [...Array(+nbOfPrograms).keys()].map((index) => ({
        target: contracts["arbiStaker"],
        params: index,
      })),
      chain: "arbitrum",
    })
  ).output.map((o) => o.output);

  const stakedByProgram = (
    await sdk.api.abi.multiCall({
      block,
      abi: arbiStakerERC20["stakedTokenTotal"],
      calls: stakingTokens.map((token) => ({
        target: contracts["arbiStaker"],
        params: token,
      })),
      chain: "arbitrum",
    })
  ).output;

  let balances = {};

  for (let i = 0; i < stakedByProgram.length; i++) {
    const { price, decimals } = await getPrice(
      stakedByProgram[i].input.params[0],
      block
    );
    const staked = new BigNumber(stakedByProgram[i].output).div(
      `1e${decimals}`
    );
    // Adding USDC decimals (6)again here `price.times(staked).times(1e6)` because `sumSingleBalance` will remove them
    const rewardProgramTVL = price.times(staked).times(1e6).toFixed(0);
    sdk.util.sumSingleBalance(
      balances,
      `arbitrum:${contracts["usdc"]}`,
      rewardProgramTVL
    );
  }

  return balances;
}

module.exports = {
  methodology:
    "TVL is calculated by summing up all reward program total staked values.",
  arbitrum: {
    tvl,
  },
};
