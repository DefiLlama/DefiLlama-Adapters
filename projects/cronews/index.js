const ADDRESSES = require('../helper/coreAssets.json')
/**
 * cronews TVL adapter
 * 
 * Tracks CRO locked in the cronewslock contract
 */

const LOCK_CONTRACT = '0x307aE8eE0CB8953AF16870DC4Fed7C5CcEA4CB59'

async function tvl(api) {
  const balance = await api.call({
    target: LOCK_CONTRACT,
    abi: 'function getTotalLocked() view returns (uint256)',
  })
  
  // Add the native CRO token to the balance
  api.addToken(ADDRESSES.null, balance)
}

module.exports = {
  cronos: {
    tvl,
  },
  methodology: 'TVL is calculated by summing the CRO locked in the cronewslock contract at 0x307aE8eE0CB8953AF16870DC4Fed7C5CcEA4CB59.',
  start: '2025-01-01',
  timetravel: true,
} 