const { staking } = require('../helper/staking');

const FACTORY_CONTRACT = '0xd4E3668A9C39ebB603f02A6987fC915dBC906B43';
const STAKER = '0x9C58a2B79cd054442D5970b925637B9E88E7ecc2';
const VRSW_TOKEN_POLYGON = '0x57999936fC9A9EC0751a8D146CcE11901Be8beD0';

async function tvl(_, _1, _2, { api }) {
  const pools = await api.fetchList({ lengthAbi: 'allPairsLength', itemAbi: 'allPairs', target: FACTORY_CONTRACT })
  const tokenLength = await api.multiCall({ abi: 'uint256:allowListLength', calls: pools })
  const nativeTokens = await api.multiCall({ abi: 'function getTokens() view returns (address, address)', calls: pools })
  const calls = []
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const tokensNumber = tokenLength[i];
    for (let j = 0; j < tokensNumber; j++) {
      calls.push({ target: pool, params: [j], poolId: i });
    }
  }
  const tokens = await api.multiCall({ abi: 'function allowList(uint256) view returns (address)', calls })
  const ownerTokens = pools.map((v, i) => [nativeTokens[i], v])
  tokens.forEach((v, i) => {
    const tokens = ownerTokens[calls[i].poolId][0]
    tokens.push(v)
  })

  return api.sumTokens({ ownerTokens, });
}

module.exports = {
  methodology: 'Sum of all pools liquidity plus staked VRSW tokens',
  polygon: {
    tvl,
    staking: staking(STAKER, VRSW_TOKEN_POLYGON),
  },
};

