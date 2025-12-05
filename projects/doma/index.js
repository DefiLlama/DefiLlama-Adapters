const { get } = require('../helper/http')
const { sumTokens2 } = require('../helper/unwrapLPs')

// VERIFIED ADDRESSES - 2024-11-27 via explorer.doma.xyz
// USDC.e (Bridged USDC via Stargate) - 6 decimals
// https://explorer.doma.xyz/token/0x31EEf89D5215C305304a2fA5376a1f1b6C5dc477
const USDC_E_ADDRESS = '0x31EEf89D5215C305304a2fA5376a1f1b6C5dc477'

// DomaFractionalization Diamond Proxy - verified via explorer.doma.xyz
// https://explorer.doma.xyz/address/0xd00000000004f450f1438cfA436587d8f8A55A29
const DOMA_FRACTIONALIZATION = '0xd00000000004f450f1438cfA436587d8f8A55A29'

// Blockscout explorer API (public, no auth required)
const EXPLORER_API = 'https://explorer.doma.xyz/api/v2'

// NameTokenFractionalized event topic (from explorer logs)
// Event: NameTokenFractionalized(address indexed tokenAddress, uint256 indexed tokenId,
//        address tokenOwner, address fractionalTokenAddress, address launchpadAddress,
//        address vestingWallet, uint256 fractionalizationVersion, tuple params)
const FRACTIONALIZED_EVENT_TOPIC = '0x033884feaa2ca8a3d4414e2f3b49f102e4eeaf1b0baf49466e0407c4770de3e5'

/**
 * Fetches all NameTokenFractionalized events from the DomaFractionalization contract
 * to discover deployed launchpad and vesting wallet addresses
 */
async function fetchFractionalizedTokens() {
  const tokens = []
  let nextPageParams = null

  do {
    let url = `${EXPLORER_API}/addresses/${DOMA_FRACTIONALIZATION}/logs`
    if (nextPageParams) {
      const params = new URLSearchParams(nextPageParams)
      url += `?${params.toString()}`
    }

    const response = await get(url)

    if (!response?.items) {
      throw new Error(`Invalid explorer response: ${JSON.stringify(response)}`)
    }

    for (const log of response.items) {
      // Filter for NameTokenFractionalized events
      const topics = log.topics || []
      if (topics[0]?.toLowerCase() !== FRACTIONALIZED_EVENT_TOPIC.toLowerCase()) {
        continue
      }

      // Extract addresses from decoded event data
      const decoded = log.decoded?.parameters
      if (!decoded) continue

      const fractionalToken = decoded.find(p => p.name === 'fractionalTokenAddress')?.value
      const launchpad = decoded.find(p => p.name === 'launchpadAddress')?.value
      const vestingWallet = decoded.find(p => p.name === 'vestingWallet')?.value

      if (fractionalToken && launchpad) {
        tokens.push({
          fractionalToken,
          launchpad,
          vestingWallet,
        })
      }
    }

    nextPageParams = response.next_page_params
  } while (nextPageParams)

  return tokens
}

/**
 * Fetches UniswapV3 pools that trade Doma fractionalized tokens
 * Only includes pools where one of the pair tokens is a Doma fractional token
 * This ensures we count Doma protocol TVL, not all chain DEX liquidity
 */
async function fetchDomaUniswapV3Pools(fractionalTokenAddresses) {
  const pools = new Set()

  for (const tokenAddress of fractionalTokenAddresses) {
    let nextPageParams = null

    do {
      let url = `${EXPLORER_API}/tokens/${tokenAddress}/holders`
      if (nextPageParams) {
        const params = new URLSearchParams(nextPageParams)
        url += `?${params.toString()}`
      }

      const response = await get(url)
      if (!response?.items) break

      for (const holder of response.items) {
        const address = holder?.address
        if (!address?.is_contract) continue

        // Only include UniswapV3Pool contracts that hold this Doma token
        if (address.name === 'UniswapV3Pool') {
          pools.add(address.hash)
        }
      }

      nextPageParams = response.next_page_params
    } while (nextPageParams)
  }

  return Array.from(pools)
}

async function tvl(api) {
  // Get all fractionalized tokens (includes launchpads)
  const fractionalizedTokens = await fetchFractionalizedTokens()

  // Extract fractional token addresses for targeted pool discovery
  const fractionalTokenAddresses = fractionalizedTokens
    .map(t => t.fractionalToken)
    .filter(Boolean)

  // Get UniswapV3 pools that specifically trade Doma fractional tokens
  const uniV3Pools = await fetchDomaUniswapV3Pools(fractionalTokenAddresses)

  // Collect protocol-owned addresses
  const protocolAddresses = new Set()

  // Add main fractionalization contract
  protocolAddresses.add(DOMA_FRACTIONALIZATION)

  // Add launchpads from fractionalization events
  // NOTE: Vesting wallets intentionally excluded - uncirculating tokens per DefiLlama methodology
  for (const token of fractionalizedTokens) {
    if (token.launchpad) protocolAddresses.add(token.launchpad)
  }

  // Add UniswapV3 pools that trade Doma tokens
  for (const pool of uniV3Pools) {
    protocolAddresses.add(pool)
  }

  const addressList = Array.from(protocolAddresses)

  console.log(`Found ${fractionalizedTokens.length} fractionalized tokens`)
  console.log(`Found ${uniV3Pools.length} UniswapV3 pools for Doma tokens`)
  console.log(`Total protocol addresses: ${addressList.length}`)

  if (addressList.length === 0) {
    console.warn('No protocol addresses found - TVL will be empty')
    return {}
  }

  // Build token-owner pairs for on-chain balance queries
  const tokensAndOwners = addressList.map(owner => [USDC_E_ADDRESS, owner])

  return sumTokens2({
    api,
    tokensAndOwners,
    resolveLP: false,
  })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology:
    'TVL is calculated by summing USDC.e balances in Doma protocol contracts: ' +
    '(1) the DomaFractionalization contract, (2) launchpad contracts where users purchase ' +
    'fractional tokens, and (3) UniswapV3 pools providing liquidity for Doma fractional tokens. ' +
    'Vesting wallets are excluded as they contain uncirculating tokens. Protocol addresses are ' +
    'discovered by querying NameTokenFractionalized events. UniV3 pools are identified by ' +
    'finding pools that hold Doma fractional token addresses.',
  doma: { tvl },
}
