const { sumTokens2 } = require('../helper/unwrapLPs')

const BEAN = '0x5c72992b83E74c4D5200A8E8920fB946214a5A5D'
const GRID_MINING = '0x9632495bDb93FD6B0740Ab69cc6c71C9c01da4f0'
const STAKING = '0xfe177128Df8d336cAf99F787b72183D1E68Ff9c2'

async function tvl(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [
      [BEAN, GRID_MINING],
      [BEAN, STAKING],
    ],
  })
}

module.exports = {
  methodology: 'TVL is BEAN tokens held in GridMining (mined rewards) and Staking (user-staked BEAN).',
  base: { tvl },
  ownTokens: true,
}
