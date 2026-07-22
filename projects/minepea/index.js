const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

const PEA = '0xfe177128Df8d336cAf99F787b72183D1E68Ff9c2'
const GRID_MINING = '0x46D5459F439E64B8CC2D02e89b137608eA5711CE'
const STAKING = '0x98842D64E73A7196c90606Dea66B666D088cC4fB'

async function tvl(api) {
  // Native ETH held by GridMining: active round deployments + unclaimed ETH winnings
  return sumTokens2({ api, owners: [GRID_MINING], tokens: [nullAddress] })
}

module.exports = {
  methodology:
    'TVL is the native ETH held by the GridMining contract (ETH deployed to active rounds plus unclaimed ETH winnings). Staking counts PEA locked in the Staking contract plus unclaimed mined PEA held by GridMining.',
  robinhood: {
    tvl,
    staking: staking([STAKING, GRID_MINING], PEA),
  },
}
