const { sumTokens2 } = require('../helper/unwrapLPs');

const SOME_FACTORY = '0x00008A3c1077325Bb19cd93e5a0f1E95144700fa';

async function tvl(api) {
  const pairsCount = await api.call({ target: SOME_FACTORY, abi: 'function allPairsLength() view returns (uint256)' });
  const indices = Array.from({ length: Number(pairsCount) }, (_, i) => i);
  const pairAddresses = await api.multiCall({ target: SOME_FACTORY, abi: 'function allPairs(uint256) view returns (address)', calls: indices.map((i) => ({ params: [i] })) });
  const tokens0 = await api.multiCall({ abi: 'function token0() view returns (address)', calls: pairAddresses });
  const tokens1 = await api.multiCall({ abi: 'function token1() view returns (address)', calls: pairAddresses });
  const tokensAndOwners = [];
  for (let i = 0; i < pairAddresses.length; i++) {
    tokensAndOwners.push([tokens0[i], pairAddresses[i]]);
    tokensAndOwners.push([tokens1[i], pairAddresses[i]]);
  }
  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  timetravel: true,
  methodology: 'TVL is the sum of reserves of token0 and token1 for every liquidity pair created by the factory on SomeSwap.',
  monad: {
    tvl
  },
};