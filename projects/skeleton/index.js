const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { getParamCalls } = require('../helper/utils')

const masterChefContract = "0x4fff737de45da4886f711b2d683fb6A6cf62C60C";
const USDC = ADDRESSES.fantom.USDC;
const chain = 'fantom'

const ftmTvl = async (_, _b, { fantom: block }) => {
  const balances = {};

  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: masterChefContract,
      chain, block,
    })
  ).output;

  const calls = getParamCalls(poolLength)
  const { output: poolData } = await sdk.api.abi.multiCall({
    target: masterChefContract,
    abi: abi.poolInfo,
    calls, chain, block,
  })
  const stratCalls = poolData.map(i => ({ target: i.output.strat }))
  const { output: stratResponse } = await sdk.api.abi.multiCall({
    abi: abi.wantLockedTotal,
    calls: stratCalls,
    chain, block,
  })
  stratResponse.forEach(({ output },i) => {
    sdk.util.sumSingleBalance(balances, 'fantom:'+poolData[i].output.want, output)
  })
  return balances
};

module.exports = {
  misrepresentedTokens: true,
  fantom: {
    tvl: ftmTvl,
  },
  methodology:
    "We count liquidity on all the Vaults through MasterChef Contract",
};
