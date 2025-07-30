/**
 * cronews TVL adapter
 * 
 * Since cronews is a social platform without smart contracts or TVL,
 * this adapter returns zero TVL for informational listing purposes.
 */

const { log } = require('../helper/logs')

async function tvl(api) {
  log.info('cronews: No TVL to track - social platform without smart contracts')
  return {}
}

module.exports = {
  cronos: {
    tvl,
  },
  methodology: 'cronews is a decentralized news platform powered by community. No TVL as it has no smart contracts or on-chain value.',
  start: '2025-01-01', // Adjust to your actual launch date
  timetravel: false,
} 