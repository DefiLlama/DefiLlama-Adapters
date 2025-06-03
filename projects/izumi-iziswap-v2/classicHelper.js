const { sumTokens2 } = require("../helper/unwrapLPs")

function fetchIziswapClassicTvl({ classicFactory, blacklistedTokens = [] }) {
  return async (api) => {
    const toa = []
    const pairsLength = await api.call({abi: abi.allPairsLength, target: classicFactory});

    const pairCalls = Array.from({ length: pairsLength }, (_, i) => ({target: classicFactory, params: [i]}));
    const pairAddresses = await api.multiCall({abi: abi.allPairs, calls: pairCalls});

    const token0s = await api.multiCall({abi: abi.token0, calls: pairAddresses});
    const token1s = await api.multiCall({abi: abi.token1, calls: pairAddresses});

    pairAddresses.forEach((pairAddress, i) => {
      toa.push([token0s[i], pairAddress], [token1s[i], pairAddress]);
    });

    return sumTokens2({ tokensAndOwners: toa, api, blacklistedTokens })
  }
}

const abi = {
  allPairs: "function allPairs(uint256) view returns (address)",
  allPairsLength: "uint256:allPairsLength",
  token0: "address:token0",
  token1: "address:token1",
}

module.exports = {
  fetchIziswapClassicTvl
}