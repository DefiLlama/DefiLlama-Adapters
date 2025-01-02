const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs, sumTokens2, } = require("../helper/unwrapLPs");

const masterChefContract = "0x243e46d50130f346bede1d9548b41c49c6440872";

const kccTvl = async (timestamp, ethBlock, { kcc: block }) => {
  const chain = 'kcc'

  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: masterChefContract,
      chain, block, 
    })
  ).output;

  const toa = [];
  const calls = [];

  for (let index = 0; index < poolLength; index++)
    calls.push({ params: index })

  const { output: res } = await sdk.api.abi.multiCall({
    target: masterChefContract,
    abi: abi.poolInfo,
    calls,
    chain, block,
  })
  res.map(i => toa.push([i.output[0], masterChefContract]))
  return sumTokens2({ chain, block, tokensAndOwners: toa, resolveLP: true, })
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "We count liquidity on the farms (LP tokens) and pools(single tokens) threw masterchef contract",
  kcc: {
    tvl: kccTvl,
  },
};