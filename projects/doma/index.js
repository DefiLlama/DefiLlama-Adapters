const { sumTokens2 } = require('../helper/unwrapLPs')

// USDC.e (Bridged USDC via Stargate) - 6 decimals
const USDC_E_ADDRESS = '0x31EEf89D5215C305304a2fA5376a1f1b6C5dc477'

// DomaFractionalization Diamond Proxy
const DOMA_FRACTIONALIZATION = '0xd00000000004f450f1438cfA436587d8f8A55A29'

// Contract deployment block
const FROM_BLOCK = 2887493

// NameTokenFractionalized event topic (keccak256 hash of event signature)
const FRACTIONALIZED_EVENT_TOPIC = '0x033884feaa2ca8a3d4414e2f3b49f102e4eeaf1b0baf49466e0407c4770de3e5'

/**
 * Fetches all launchpad addresses from NameTokenFractionalized events via on-chain logs.
 * Event data layout: tokenOwner (32) + fractionalTokenAddress (32) + launchpadAddress (32) + ...
 */
async function fetchLaunchpads(api) {
  const logs = await api.provider.getLogs({
    address: DOMA_FRACTIONALIZATION,
    fromBlock: FROM_BLOCK,
    toBlock: await api.provider.getBlockNumber(),
    topics: [FRACTIONALIZED_EVENT_TOPIC]
  })

  const launchpads = new Set()
  for (const log of logs) {
    // launchpadAddress is the 3rd non-indexed param (offset 128 in data, 64 hex chars per 32 bytes)
    const data = log.data.slice(2) // Remove 0x
    const launchpadAddress = '0x' + data.slice(128, 192).slice(24) // Extract address from 32-byte word
    if (launchpadAddress && launchpadAddress.length === 42) {
      launchpads.add(launchpadAddress)
    }
  }

  return Array.from(launchpads)
}

async function tvl(api) {
  const launchpads = await fetchLaunchpads(api)

  // TVL = USDC.e in Doma-owned contracts only:
  // 1. DomaFractionalization contract - holds buyout/redemption funds
  // 2. Launchpad contracts - holds USDC.e from token sales
  //
  // Note: Graduated launchpads are included but will have $0 balance
  // since their funds migrated to Uniswap V3 pools.
  //
  // Excluded:
  // - Uniswap V3 pools (DEX liquidity, not protocol-locked value)
  // - Vesting wallets (uncirculating tokens)
  const protocolAddresses = [
    DOMA_FRACTIONALIZATION,
    ...launchpads
  ]

  if (protocolAddresses.length === 0) return {}
  
  const tokensAndOwners = protocolAddresses.map(owner => [USDC_E_ADDRESS, owner])

  return sumTokens2({
    api,
    tokensAndOwners,
    resolveLP: false,
  })
}

module.exports = {
  methodology:
    'TVL is calculated by summing USDC.e balances in Doma protocol contracts: ' +
    '(1) the DomaFractionalization contract which holds buyout/redemption funds, and ' +
    '(2) launchpad contracts discovered via on-chain NameTokenFractionalized events. ' +
    'Graduated launchpads have $0 balance since funds migrate to DEX pools upon graduation. ' +
    'Uniswap V3 pools are excluded as they represent DEX liquidity, not protocol-locked value. ' +
    'Vesting wallets are excluded as they contain uncirculating tokens.',
  doma: { tvl },
}
