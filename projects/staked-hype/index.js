const ADDRESSES = require('../helper/coreAssets.json')

// Staked Hype (stHYPE) - Liquid staking protocol for Hyperliquid
const STHYPE_TOKEN = '0xfFaa4a3D97fE9107Cef8a3F48c069F577Ff76cC1'
const WHYPE = ADDRESSES.hyperliquid.WHYPE

async function tvl(api) {
  // Get total staked HYPE using totalAssets() method
  const totalStakedHYPE = await api.call({
    target: STHYPE_TOKEN,
    abi: 'uint256:totalSupply'
  })

  // Add HYPE (underlying asset) to TVL
  api.add(WHYPE, totalStakedHYPE)
}

module.exports = {
  methodology: 'Tracks the total value of HYPE tokens staked through the Staked Hype liquid staking protocol. Users stake HYPE and receive stHYPE tokens that accrue rewards via rebase.',
  hyperliquid: {
    tvl
  }
}
