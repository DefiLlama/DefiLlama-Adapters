const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokens2, } = require("../helper/unwrapLPs");
const { stakings } = require("../helper/staking");

const proxyContract = "0x5406e1136F423602C0685DF8802f8ef28b73570d";
const candyFarmsContracts = [
  "0xb9e10599248f9f3fd35ecd1a098f56dab537ebbe",
  "0xd05497c6e24f7013ab67cdc8fa4d5af48e58ebe9",
  "0xebb7ab0b5a219bb395b88dfb1e5ae05ef8fddfa7",
];
const POP = "0x7fc3ec3574d408f3b59cd88709bacb42575ebf2b";

const ethTvl = async (ts, block) => {
  const countMlp = (
    await sdk.api.abi.call({
      abi: abi.pendingMlpCount,
      target: proxyContract,
      block,
    })
  ).output;

  const calls = []
  const mlpCalls = []

  for (let i = 0; i < countMlp; i++) {
    calls.push({ params: i })
    if (i < 6) mlpCalls.push({ params: i })
  }

  const { output: getMlp } = await sdk.api.abi.multiCall({
    target: proxyContract,
    abi: abi.getMlp,
    calls, block,
  })

  const { output: mlps } = await sdk.api.abi.multiCall({
    target: proxyContract,
    abi: abi.allMlp,
    calls: mlpCalls, block,
  })
  const tokensAndOwners = []
  getMlp.forEach(({ output: { uniswapPair }}, i) => {
    let owner = mlps[i] ? mlps[i].output : proxyContract
    tokensAndOwners.push([uniswapPair, owner])
  })


  return sumTokens2({ block, tokensAndOwners, resolveLP: true, })
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: stakings(candyFarmsContracts, POP),
    tvl: ethTvl,
  },
  methodology:
    "We count liquidity on the Marketplace and CandyFarms through Proxy and CandyFarm Contracts",
};
