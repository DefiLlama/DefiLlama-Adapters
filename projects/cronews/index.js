/**
 * CroNews TVL adapter
 * 
 * Since CroNews is a social platform without smart contracts or TVL,
 * this adapter returns zero TVL for informational listing purposes.
 */

async function tvl(api) {
  // CroNews is a social platform without smart contracts
  // No TVL to track - returns empty object (zero TVL)
  return {}
}

module.exports = {
  cronos: {
    tvl,
  },
  methodology: 'CroNews is a decentralized news platform powered by community. No TVL as it has no smart contracts or on-chain value.',
  start: '2025-01-01', // Adjust to your actual launch date
  timetravel: false,
} 