const ADDRESSES = require('../helper/coreAssets.json')
const config = {
  'ethereum': {
    marketFactory: ['0x1F728c2fD6a3008935c1446a965a313E657b7904'],
    marketView: '0xAb797C4C6022A401c31543E316D3cd04c67a87fC',
    collateralToken: ADDRESSES.ethereum.SDAI,
    conditionalTokens: '0xC59b0e4De5F1248C1140964E0fF287B192407E0C'
  },
  'xdai': {
    marketFactory: ['0x83183DA839Ce8228E31Ae41222EaD9EDBb5cDcf1'],
    marketView: '0x995dC9c89B6605a1E8cc028B37cb8e568e27626f',
    collateralToken: ADDRESSES.xdai.SDAI,
    conditionalTokens: '0xCeAfDD6bc0bEF976fdCd1112955828E00543c0Ce'
  },
}

const MARKET_VIEW_ABI =
  'function getMarket(address marketFactory, address market) public view returns (tuple(address id, string marketName, string[] outcomes, address parentMarket, uint256 parentOutcome, address[] wrappedTokens, uint256 outcomesSupply, uint256 lowerBound, uint256 upperBound, bytes32 parentCollectionId, bytes32 conditionId, bytes32 questionId, uint256 templateId, tuple(bytes32 content_hash, address arbitrator, uint32 opening_ts, uint32 timeout, uint32 finalize_ts, bool is_pending_arbitration, uint256 bounty, bytes32 best_answer, bytes32 history_hash, uint256 bond, uint256 min_bond)[] questions, bytes32[] questionsIds, string[] encodedQuestions,bool payoutReported) memory)'

async function tvl(api) {
  const { marketFactory, marketView, collateralToken, conditionalTokens } = config[api.chain]
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
  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: uniqueTokenArray })
  supplies.forEach((supply, i) => {
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
 * Calculates total TVL by:
 * 1. Rolling up child market supplies into parent markets (recursively)
 * 2. Deduplicating markets that share wrapped tokens (via CREATE2 deterministic addresses)
 * 3. Properly weighting resolved markets by their payout ratios
 * 4. Only counting root markets (which hold actual sDAI)
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
      if (parentOutcome < supplies.length) {
        supplies[parentOutcome] = (supplies[parentOutcome] || 0n) + childEffectiveSupply
      }
    })
    
    // Calculate market's effective supply based on resolution status
    if (market.payoutReported && market.payoutNumeratorsBig && market.payoutDenominatorBig > 0n) {
      // Resolved: weight by payout ratios
      let weighted = 0n
      supplies.forEach((supply, i) => {
        const numerator = market.payoutNumeratorsBig[i] || 0n
        weighted += (supply * numerator) / market.payoutDenominatorBig
      })
      return weighted
    } else {
      // Unresolved: all outcomes represent equal collateral
      return supplies.reduce((max, supply) => supply > max ? supply : max, 0n)
    }
  }
  
  let totalSupply = 0n
  const processedTokenSets = new Set()
  
  marketsData.forEach(market => {
    if (!market.wrappedTokens || market.wrappedTokens.length === 0) return
    
    // Only count root markets (they hold the actual sDAI)
    if (market.parentMarket !== ADDRESSES.null) return
    
    // Deduplicate markets sharing the same wrapped tokens
    const tokenSetId = [...market.wrappedTokens].sort().join('|')
    if (processedTokenSets.has(tokenSetId)) return
    processedTokenSets.add(tokenSetId)
    
    // Calculate total including child market supplies
    totalSupply += getEffectiveSupplyWithChildren(market)
  })
  
  return totalSupply
}

module.exports = {
  ethereum: { tvl },
  xdai: { tvl },
  methodology: 'TVL represents the total quantity of sDAI held in the conditional tokens contract. The sDAI is withdrawn when the participants merge or redeem their tokens.',
}
