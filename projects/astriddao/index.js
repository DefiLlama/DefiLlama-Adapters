const { sumTokens } = require('../helper/unwrapLPs')
const { getFixBalances } = require('../helper/portedTokens')

const WASTAR = "0x19574c3c8fafc875051b665ec131b7e60773d2c9"
const chain = 'astar'

const CONTRACT_ADDRESSES = {
  // Pools holding ASTR.
  ACTIVE_POOL: "0x70724b57618548eE97623146F76206033E67086e",
  DEFAULT_POOL: "0x2fE3FDf91786f75C92e8AB3B861588D3D051D83F",
};

async function tvl(ts, _block, chainBlocks ) {
  const block = chainBlocks[chain]
  const balances = {}
  const tokensAndOwners = Object.values(CONTRACT_ADDRESSES).map(owner => [WASTAR, owner])
  await sumTokens(balances, tokensAndOwners, block, chain);
  (await getFixBalances(chain))(balances)
  return balances
}

module.exports = {
  timetravel: true,
  start: 915830,
  methodology: "Total locked ASTR (in wrapped ERC-20 form) in ActivePool and DefaultPool",
  astar: {
    tvl,
  },
};
