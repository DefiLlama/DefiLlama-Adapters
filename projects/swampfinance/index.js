const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapLPsAuto } = require("../helper/unwrapLPs");
const { transformBscAddress } = require("../helper/portedTokens");

const NATIVE_CONTRACT = "0x33AdBf5f1ec364a4ea3a5CA8f310B597B8aFDee3";
const chain = 'bsc'

const bscTvl = async (_, _b, { [chain]: block }) => {
  const balances = {};

  const poolLenth = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: NATIVE_CONTRACT,
      chain, block,
    })
  ).output;

  const calls = [];

  for (let index = 0; index < poolLenth; index++)
    calls.push({ params: index })

  const transformAddress = await transformBscAddress()
  const { output: strats } = await sdk.api.abi.multiCall({
    target: NATIVE_CONTRACT,
    abi: abi.poolInfo,
    calls,
    chain, block,
  })
  const { output: wantBalances } = await sdk.api.abi.multiCall({
    abi: abi.wantLockedTotal,
    calls: strats.map(i => ({ target: i.output[4] })),
    chain, block,
  })

  strats.forEach((strat, i) => {
    sdk.util.sumSingleBalance(balances, transformAddress(strat.output[0]), wantBalances[i].output)
  })

  return unwrapLPsAuto({ balances, block, chain, });
};

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
};
