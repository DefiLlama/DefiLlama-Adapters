const abi = {
  "pendingMlpCount": "uint256:pendingMlpCount",
  "allMlp": "function allMlp(uint256) view returns (address)",
  "uniswapPair": "address:uniswapPair",
  "getMlp": "function getMlp(uint256) view returns (address uniswapPair, address submitter, uint256 liquidity, uint256 endDate, uint8 status, uint256 bonusToken0, uint256 bonusToken1)"
}
const { sumTokens2, } = require("../helper/unwrapLPs");
const { stakings } = require("../helper/staking");

const proxyContract = "0x5406e1136F423602C0685DF8802f8ef28b73570d";
const candyFarmsContracts = [
  "0xb9e10599248f9f3fd35ecd1a098f56dab537ebbe",
  "0xd05497c6e24f7013ab67cdc8fa4d5af48e58ebe9",
  "0xebb7ab0b5a219bb395b88dfb1e5ae05ef8fddfa7",
];
const POP = "0x7fc3ec3574d408f3b59cd88709bacb42575ebf2b";

const ethTvl = async (api) => {
  const countMlp = await api.call({ abi: abi.pendingMlpCount, target: proxyContract, })

  const calls = []
  const mlpCalls = []

  for (let i = 0; i < countMlp; i++) {
    calls.push(i)
    if (i < 6) mlpCalls.push(i)
  }

  const getMlp = await api.multiCall({ target: proxyContract, abi: abi.getMlp, calls, })
  const mlps = await api.multiCall({ target: proxyContract, abi: abi.allMlp, calls: mlpCalls, })
  mlps.push(proxyContract)
  return sumTokens2({ api, tokens: getMlp.map(i => i.uniswapPair), owners: mlps, resolveLP: true, })
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
