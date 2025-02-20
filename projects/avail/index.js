const { getTokenData } = require('../helper/chain/avail')

// Get total amount of AVAIL tokens staked by validators and nominators
async function tvl(timestamp, block, chainBlocks) {
  try {
    const { stakedAmount } = await getTokenData()
    return {
      avail: stakedAmount
    }
  } catch (e) {
    return { avail: 0 }
  }
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "TVL consists of AVAIL tokens locked in the network's staking system for validation and security.",
  avail: {
    tvl
  }
}