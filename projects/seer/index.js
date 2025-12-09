const ADDRESSES = require('../helper/coreAssets.json')
const config = {
  'ethereum': {
    marketFactory: ['0x1F728c2fD6a3008935c1446a965a313E657b7904'],
    marketView: '0xAb797C4C6022A401c31543E316D3cd04c67a87fC',
    collateralToken: ADDRESSES.ethereum.SDAI,
    conditionalTokens: '0xC59b0e4De5F1248C1140964E0fF287B192407E0C',
    poolFactory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
  },
  'xdai': {
    marketFactory: ['0x83183DA839Ce8228E31Ae41222EaD9EDBb5cDcf1'],
    futarchyFactory: '0xa6cb18fcdc17a2b44e5cad2d80a6d5942d30a345', // Futarchy markets with multiple collaterals
    marketView: '0x995dC9c89B6605a1E8cc028B37cb8e568e27626f',
    collateralToken: ADDRESSES.xdai.SDAI,
    conditionalTokens: '0xCeAfDD6bc0bEF976fdCd1112955828E00543c0Ce',
    poolFactory: '0xA0864cCA6E114013AB0e27cbd5B6f4c8947da766'
  },
}

const MARKET_VIEW_ABI =
  'function getMarket(address marketFactory, address market) public view returns (tuple(address id, string marketName, string[] outcomes, address parentMarket, uint256 parentOutcome, address[] wrappedTokens, uint256 outcomesSupply, uint256 lowerBound, uint256 upperBound, bytes32 parentCollectionId, bytes32 conditionId, bytes32 questionId, uint256 templateId, tuple(bytes32 content_hash, address arbitrator, uint32 opening_ts, uint32 timeout, uint32 finalize_ts, bool is_pending_arbitration, uint256 bounty, bytes32 best_answer, bytes32 history_hash, uint256 bond, uint256 min_bond)[] questions, bytes32[] questionsIds, string[] encodedQuestions,bool payoutReported) memory)'
const ETH_GET_POOL_ABI = 'function getPool(address token1, address token0, uint24 fee) external view returns (address pool)'
const XDAI_GET_POOL_ABI = 'function poolByPair(address token1, address token0) external view returns (address pool)'

async function tvl(api) {
  const { marketFactory, futarchyFactory, marketView, collateralToken, conditionalTokens } = config[api.chain]
  // get all markets
  const markets = await api.multiCall({ abi: 'address[]:allMarkets', calls: marketFactory })
  const dataCalls = markets.map((v, i) => {
    return v.map(val => ({ params: [marketFactory[i], val] }))
  }).flat()

  /*
  * marketsData is an array of objects with the following structure:
  *  - id
  *  - parentMarket
  *  - parentOutcome
  *  - wrappedTokens
  *  - outcomesSupply
  *  - conditionId
  *  - payoutReported
  */
  const marketsData = (await api.multiCall({ abi: MARKET_VIEW_ABI, calls: dataCalls, target: marketView })).map(market => ({
    id: market.id,
    parentMarket: market.parentMarket,
    parentOutcome: market.parentOutcome,
    parentCollectionId: market.parentCollectionId,
    wrappedTokens: market.wrappedTokens,
    outcomesSupply: (market.wrappedTokens ?? []).map(_ => 0),
    conditionId: market.conditionId,
    payoutReported: market.payoutReported,
  }))

  // Fetch token supplies (deduplicated to avoid redundant calls for shared tokens)
  const uniqueTokens = new Set()
  const tokenToMarkets = new Map()
  marketsData.forEach((market, marketIdx) => {
    market.wrappedTokens.forEach((token, outcomeIdx) => {
      uniqueTokens.add(token)
      if (!tokenToMarkets.has(token)) {
        tokenToMarkets.set(token, [])
      }
      tokenToMarkets.get(token).push({ marketIdx, outcomeIdx })
    })
  })

  const uniqueTokenArray = Array.from(uniqueTokens)
  const supplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: uniqueTokenArray,
    permitFailure: true  // Allow individual failures
  })

  supplies.forEach((supply, i) => {
    if (!supply) return // Skip failed calls
    const token = uniqueTokenArray[i]
    const marketMappings = tokenToMarkets.get(token) || []

    marketMappings.forEach(({ marketIdx, outcomeIdx }) => {
      marketsData[marketIdx].outcomesSupply[outcomeIdx] = BigInt(supply)
    })
  })

  // Process resolved markets - fetch payout data from ConditionalTokens
  await fetchPayoutData(api, marketsData, conditionalTokens)

  const totalSupply = calculateTotalSupply(marketsData);
  api.add(collateralToken, totalSupply);

  // Add futarchy market TVL (Gnosis chain only)
  if (futarchyFactory && api.chain === 'xdai') {
    try {
      await processFutarchyMarkets(api, futarchyFactory)
    } catch (error) {
      // Silent fail - futarchy markets are optional
    }
  }

  // Add pool TVL
  await processPoolTVL(api, uniqueTokenArray, collateralToken)
}

async function processPoolTVL(api, wrappedTokens, collateralToken) {
  let pools = []
  if (api.chain == 'ethereum') {
    // check all fee tiers 500, 3000, 10000 for pools
    // use multicall to get all pools
    const callsPools500 = wrappedTokens.map(token => ({ target: config[api.chain].poolFactory, params: [collateralToken, token, 500] }))
    const callsPools3000 = wrappedTokens.map(token => ({ target: config[api.chain].poolFactory, params: [collateralToken, token, 3000] }))
    const callsPools10000 = wrappedTokens.map(token => ({ target: config[api.chain].poolFactory, params: [collateralToken, token, 10000] }))
    const allCalls = [...callsPools500, ...callsPools3000, ...callsPools10000]
    // now batch these calls in a big multicall
    pools = await api.multiCall({ abi: ETH_GET_POOL_ABI, calls: allCalls })
  } else if (api.chain == 'xdai') {
    pools = await api.multiCall({ abi: XDAI_GET_POOL_ABI, calls: wrappedTokens.map(token => ({ target: config[api.chain].poolFactory, params: [collateralToken, token] })) })
  }
  // filter out zero addresses
  const nonZeroPools = pools.filter(pool => pool !== ADDRESSES.null)
  // read the collateral token balance of the non-zero pool
  // we don't count the outcome token since we already counted it in the total supply calculation in the TVL calculation
  const poolCollateralBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: nonZeroPools.map(pool => ({ target: collateralToken, params: [pool] })) })  // now add the supply of the collateral token to the pool TVL
  const poolTVL = poolCollateralBalances.reduce((acc, balance) => acc + BigInt(balance), 0n)
  api.add(collateralToken, poolTVL)
}

/**
 * Fetches payout data for resolved markets from ConditionalTokens
 */
async function fetchPayoutData(api, marketsData, conditionalTokens) {
  // Filter for markets that are reported as resolved
  const resolvedMarkets = marketsData.filter(m =>
    m.payoutReported &&
    m.conditionId !== '0x0000000000000000000000000000000000000000000000000000000000000000'
  )

  if (resolvedMarkets.length === 0) return

  // Step 1: Check which markets have valid payout denominators
  const denominatorCalls = resolvedMarkets.map(m => ({
    target: conditionalTokens,
    params: [m.conditionId]
  }))

  const payoutDenominators = await api.multiCall({
    abi: 'function payoutDenominator(bytes32) view returns (uint256)',
    calls: denominatorCalls,
    permitFailure: true
  })

  // Filter markets with valid denominators
  const marketsWithPayouts = []
  resolvedMarkets.forEach((market, i) => {
    const denominator = payoutDenominators[i]
    if (denominator && BigInt(denominator) > 0n) {
      market.payoutDenominatorBig = BigInt(denominator)
      marketsWithPayouts.push(market)
    }
  })

  if (marketsWithPayouts.length === 0) return

  // Step 2: Batch fetch all payout numerators
  const numeratorCalls = []
  const callMapping = [] // Maps each call back to market and outcome

  marketsWithPayouts.forEach((market) => {
    const outcomeCount = market.wrappedTokens?.length || 0
    for (let outcomeIdx = 0; outcomeIdx < outcomeCount; outcomeIdx++) {
      numeratorCalls.push({
        target: conditionalTokens,
        params: [market.conditionId, outcomeIdx]
      })
      callMapping.push({ market, outcomeIdx })
    }
  })

  if (numeratorCalls.length === 0) return

  const numeratorResults = await api.multiCall({
    abi: 'function payoutNumerators(bytes32, uint256) view returns (uint256)',
    calls: numeratorCalls,
    permitFailure: true
  })

  // Step 3: Organize numerators by market
  marketsWithPayouts.forEach(market => {
    market.payoutNumeratorsBig = []
  })

  numeratorResults.forEach((result, i) => {
    const { market, outcomeIdx } = callMapping[i]
    market.payoutNumeratorsBig[outcomeIdx] = result ? BigInt(result) : 0n
  })
}

/**
 * Calculates total TVL for regular Seer markets.
 * Handles hierarchical markets where child markets use parent outcome tokens as collateral.
 * Ensures accurate TVL by:
 * - Including child market supplies in parent outcomes (recursive bubbling)
 * - Deduplicating shared wrapped tokens (CREATE2 deterministic addresses)
 * - Weighting resolved markets by payout ratios
 * - Only counting root markets that hold actual sDAI
 */
function calculateTotalSupply(marketsData) {
  // Build parent-child relationships for efficient lookup
  const childrenByParent = new Map()
  marketsData.forEach(market => {
    if (market.parentMarket && market.parentMarket !== ADDRESSES.null) {
      if (!childrenByParent.has(market.parentMarket)) {
        childrenByParent.set(market.parentMarket, [])
      }
      childrenByParent.get(market.parentMarket).push(market)
    }
  })

  // Recursively calculate effective supply for a market including child markets
  function getEffectiveSupplyWithChildren(market) {
    const supplies = [...market.outcomesSupply] // Clone to avoid mutation

    // Add supplies from child markets to the corresponding parent outcome
    const children = childrenByParent.get(market.id) || []
    children.forEach(child => {
      // Recursively get child's effective supply (including its own children)
      const childEffectiveSupply = getEffectiveSupplyWithChildren(child)
      // Add to parent's outcome that child is conditional on
      const parentOutcome = child.parentOutcome
      if (typeof parentOutcome === 'number' && parentOutcome >= 0 && parentOutcome < supplies.length) {
        supplies[parentOutcome] = (supplies[parentOutcome] || 0n) + childEffectiveSupply
      }
    })

    // Calculate market's effective supply based on resolution status
    if (market.payoutReported && market.payoutNumeratorsBig && market.payoutDenominatorBig > 0n) {
      // Resolved: weight by payout ratios
      let weighted = 0n
      supplies.forEach((supply, i) => {
        const numerator = market.payoutNumeratorsBig[i] || 0n
        if (supply > 0n && numerator > 0n) {
          weighted += (supply * numerator) / market.payoutDenominatorBig
        }
      })
      return weighted
    } else {
      // Unresolved: all outcomes represent equal collateral
      return supplies.reduce((max, supply) => supply > max ? supply : max, 0n)
    }
  }

  let totalSupply = 0n
  const processedMarkets = new Set()

  marketsData.forEach(market => {
    if (!market.wrappedTokens || market.wrappedTokens.length === 0) return

    // Only count root markets (they hold the actual sDAI)
    if (market.parentMarket !== ADDRESSES.null) return

    // Deduplicate markets by their unique wrapped token set
    // Markets with same wrapped tokens are duplicates (CREATE2 deterministic addresses)
    const marketId = [...market.wrappedTokens].sort().join('|')
    if (processedMarkets.has(marketId)) return
    processedMarkets.add(marketId)

    // Calculate total including child market supplies
    totalSupply += getEffectiveSupplyWithChildren(market)
  })

  return totalSupply
}

/**
 * Processes futarchy markets with dual collateral tokens.
 * Futarchy markets have 4 wrapped outcomes but only 2 resolution states (YES/NO).
 * For resolved markets, only winning outcomes contribute to TVL.
 */
async function processFutarchyMarkets(api, futarchyFactory) {
  // Get the total count of futarchy proposals
  let marketsCount = await api.call({
    abi: 'function marketsCount() view returns (uint256)',
    target: futarchyFactory
  })

  if (!marketsCount || marketsCount === 0) return

  // Fetch all futarchy proposals efficiently
  const proposalCalls = Array.from({ length: Number(marketsCount) }, (_, i) => ({
    target: futarchyFactory,
    params: [i]
  }))

  const proposals = await api.multiCall({
    abi: 'function proposals(uint256) view returns (address)',
    calls: proposalCalls,
    permitFailure: true
  })

  const futarchyMarkets = proposals.filter(Boolean)
  if (futarchyMarkets.length === 0) return

  // Fetch collateral tokens and condition IDs for each market
  const [token1Calls, token2Calls, conditionIdCalls] = await Promise.all([
    api.multiCall({
      abi: 'function collateralToken1() view returns (address)',
      calls: futarchyMarkets,
      permitFailure: true
    }),
    api.multiCall({
      abi: 'function collateralToken2() view returns (address)',
      calls: futarchyMarkets,
      permitFailure: true
    }),
    api.multiCall({
      abi: 'function conditionId() view returns (bytes32)',
      calls: futarchyMarkets,
      permitFailure: true
    })
  ])

  // Get wrapped tokens and their supplies
  const wrappedTokenCalls = futarchyMarkets.flatMap(market =>
    [0, 1, 2, 3].map(i => ({ target: market, params: [i] }))
  )

  const wrappedTokens = await api.multiCall({
    abi: 'function wrappedOutcome(uint256) view returns (address)',
    calls: wrappedTokenCalls,
    permitFailure: true
  })

  // Get supplies for all wrapped tokens
  const validTokens = wrappedTokens.filter(Boolean)
  if (validTokens.length === 0) return

  const supplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: validTokens,
    permitFailure: true
  })

  // Check resolution status for all markets with valid condition IDs
  const conditionalTokens = '0xCeAfDD6bc0bEF976fdCd1112955828E00543c0Ce' // ConditionalTokens on Gnosis
  const validConditionIds = conditionIdCalls.filter(id => id && id !== '0x0000000000000000000000000000000000000000000000000000000000000000')

  // Fetch payout denominators to check resolution status
  const payoutDenominators = await api.multiCall({
    abi: 'function payoutDenominator(bytes32) view returns (uint256)',
    calls: validConditionIds.map(id => ({ target: conditionalTokens, params: [id] })),
    permitFailure: true
  })

  // For resolved markets, fetch the payout numerators (only 2 outcomes for futarchy: YES/NO)
  const resolvedMarketIndices = []
  const numeratorCalls = []

  validConditionIds.forEach((conditionId, idx) => {
    if (payoutDenominators[idx] && BigInt(payoutDenominators[idx]) > 0n) {
      resolvedMarketIndices.push(idx)
      // Binary resolution: YES (index 0) or NO (index 1)
      numeratorCalls.push({ target: conditionalTokens, params: [conditionId, 0] }) // YES
      numeratorCalls.push({ target: conditionalTokens, params: [conditionId, 1] }) // NO
    }
  })

  const payoutNumerators = numeratorCalls.length > 0 ? await api.multiCall({
    abi: 'function payoutNumerators(bytes32, uint256) view returns (uint256)',
    calls: numeratorCalls,
    permitFailure: true
  }) : []

  // Track TVL by collateral token
  const collateralTVL = new Map()
  const processedMarkets = new Set() // Avoid double-counting shared markets

  // Process each futarchy market
  for (let i = 0; i < futarchyMarkets.length; i++) {
    const collateralToken1 = token1Calls[i]
    const collateralToken2 = token2Calls[i]
    const conditionId = conditionIdCalls[i]

    if (!collateralToken1 || !collateralToken2 || !conditionId) continue

    // Skip if we've already processed this market
    // Futarchy markets don't have parentCollectionId, so we use conditionId + collateral tokens
    const marketId = `${conditionId}|${collateralToken1}|${collateralToken2}`
    if (processedMarkets.has(marketId)) continue
    processedMarkets.add(marketId)

    // Get supplies for this market's 4 outcomes
    const marketSupplies = []
    for (let j = 0; j < 4; j++) {
      const tokenIdx = i * 4 + j
      if (tokenIdx < wrappedTokens.length && wrappedTokens[tokenIdx]) {
        const supplyIdx = validTokens.indexOf(wrappedTokens[tokenIdx])
        if (supplyIdx >= 0 && supplies[supplyIdx]) {
          marketSupplies.push(BigInt(supplies[supplyIdx]))
        } else {
          marketSupplies.push(0n)
        }
      } else {
        marketSupplies.push(0n)
      }
    }

    // Check if market is resolved
    const conditionIdx = validConditionIds.indexOf(conditionId)
    const isResolved = conditionIdx >= 0 && payoutDenominators[conditionIdx] && BigInt(payoutDenominators[conditionIdx]) > 0n

    if (isResolved) {
      // Market is resolved - check which outcome won (YES or NO)
      const resolvedIdx = resolvedMarketIndices.indexOf(conditionIdx)
      if (resolvedIdx < 0) continue // Safety check

      const yesNumerator = payoutNumerators[resolvedIdx * 2] ? BigInt(payoutNumerators[resolvedIdx * 2]) : 0n
      const noNumerator = payoutNumerators[resolvedIdx * 2 + 1] ? BigInt(payoutNumerators[resolvedIdx * 2 + 1]) : 0n

      if (yesNumerator > 0n) {
        // YES won - outcomes 0 and 2 are redeemable
        if (marketSupplies[0] > 0n) {
          const current1 = collateralTVL.get(collateralToken1) || 0n
          collateralTVL.set(collateralToken1, current1 + marketSupplies[0])
        }
        if (marketSupplies[2] > 0n) {
          const current2 = collateralTVL.get(collateralToken2) || 0n
          collateralTVL.set(collateralToken2, current2 + marketSupplies[2])
        }
      } else if (noNumerator > 0n) {
        // NO won - outcomes 1 and 3 are redeemable
        if (marketSupplies[1] > 0n) {
          const current1 = collateralTVL.get(collateralToken1) || 0n
          collateralTVL.set(collateralToken1, current1 + marketSupplies[1])
        }
        if (marketSupplies[3] > 0n) {
          const current2 = collateralTVL.get(collateralToken2) || 0n
          collateralTVL.set(collateralToken2, current2 + marketSupplies[3])
        }
      }
    } else {
      // Unresolved market - use max supply approach
      // Outcomes 0-1 are for collateralToken1
      if (marketSupplies[0] + marketSupplies[1] > 0n) {
        const maxSupply1 = marketSupplies[0] > marketSupplies[1] ? marketSupplies[0] : marketSupplies[1]
        const current1 = collateralTVL.get(collateralToken1) || 0n
        collateralTVL.set(collateralToken1, current1 + maxSupply1)
      }

      // Outcomes 2-3 are for collateralToken2
      if (marketSupplies[2] + marketSupplies[3] > 0n) {
        const maxSupply2 = marketSupplies[2] > marketSupplies[3] ? marketSupplies[2] : marketSupplies[3]
        const current2 = collateralTVL.get(collateralToken2) || 0n
        collateralTVL.set(collateralToken2, current2 + maxSupply2)
      }
    }
  }

  // Add each collateral token to the API
  for (const [token, amount] of collateralTVL) {
    if (amount > 0n) {
      api.add(token, amount)
    }
  }
}

module.exports = {
  ethereum: { tvl },
  xdai: { tvl },
  methodology: 'TVL counts collateral locked in Seer prediction markets. Futarchy markets with dual collaterals are counted separately by token type. Resolved markets are weighted by payout ratios.',
}
