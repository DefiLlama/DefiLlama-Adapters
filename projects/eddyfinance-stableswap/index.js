const { getUniTVL } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs');

const getReserves = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1)';

const stablePools = [
  '0x448028804461e8e5a8877c228F3adFd58c3Da6B6', // 4 asset pool
  '0x01a9cd602c6c3f05ea9a3a55184c2181bd43e4b8', // 2 asset pool accumulated finance
  '0xee1629de70afaf3ae3592a9d6d859949750aa697', // 2 asset pool zearn
  '0x89cb3fA2A7910A268e9f7F619108aFADBD7587c4' // 2 asset UltiVerse pool
]

async function stableSwapTvl(api) {
  const params = [0, 1, 2, 3]
  const calls = []
  stablePools.forEach(pool => {
    params.forEach(param =>
      calls.push({ target: pool, params: param }))
  })
  const tokens = await api.multiCall({ abi: 'function coins(uint256) view returns (address)', calls, permitFailure: true })
  const tokensAndOwners = []
  tokens.forEach((token, i) => {
    if (!token) return;
    tokensAndOwners.push([token, calls[i].target])
  })

  return sumTokens2({ api, tokensAndOwners, blacklistedTokens: stablePools })
}



module.exports = {
  misrepresentedTokens: true,
  methodology: "Sum of tvl of the StableSwap pools",
  zeta: { tvl:  stableSwapTvl },
};