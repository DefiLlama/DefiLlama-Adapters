const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { createIncrementArray } = require("../helper/utils");
const { sumTokens2 } = require('../helper/unwrapLPs')

const chain = 'avax'
const FARMING_CONTRACT_ADDRESS = "0xf61b4f980A1F34B55BBF3b2Ef28213Efcc6248C4";

const avaxTvl = async (timestamp, ethBlock, {[chain]: block }) => {
  const lengthOfPool = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: FARMING_CONTRACT_ADDRESS,
      chain, block,
    })
  ).output;

  const calls = createIncrementArray(lengthOfPool).map(i => ({ params: i }));
  const { output } = await sdk.api.abi.multiCall({
    target: FARMING_CONTRACT_ADDRESS,
    abi: abi.poolInfo,
    calls,
    chain, block,
  })

  const toa = output.map(i => ([i.output[0], FARMING_CONTRACT_ADDRESS]))
  return sumTokens2({ chain, block, tokensAndOwners: toa,})
};

module.exports = {
  avax:{
    tvl: avaxTvl,
  },
  methodology:
  'The Zabu Farm Contract Address is used to obtain the balance held in every LP pair and single assets.',
};
