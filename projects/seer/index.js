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

  // Fetch token supplies for all outcome tokens
  const supplyCalls = []
  const supplyMapping = [] // Track which supply belongs to which market/outcome

  marketsData.forEach((market, marketIdx) => {
    market.wrappedTokens.forEach((token, outcomeIdx) => {
      supplyCalls.push(token)
      supplyMapping.push({ marketIdx, outcomeIdx })
    })
  })

  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: supplyCalls })

  // Map supplies back to markets
  supplies.forEach((supply, i) => {
    const { marketIdx, outcomeIdx } = supplyMapping[i]
    marketsData[marketIdx].outcomesSupply[outcomeIdx] = BigInt(supply)
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

  marketsWithPayouts.forEach((market, marketIdx) => {
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
 * Calculates the effective supply for a market based on its resolution status
 */
function getEffectiveSupply(market, supplies) {
  if (!supplies || supplies.length === 0) return 0n

  // For resolved markets with payout data, calculate weighted supply
  if (market.payoutReported && market.payoutNumeratorsBig && market.payoutDenominatorBig > 0n) {
    let weightedSupply = 0n
    const numerators = market.payoutNumeratorsBig
    const denominator = market.payoutDenominatorBig

    for (let i = 0; i < supplies.length && i < numerators.length; i++) {
      weightedSupply += (supplies[i] * numerators[i]) / denominator
    }
    return weightedSupply
  }

  // For unresolved markets, use the maximum supply (all outcomes should be equal)
  return supplies.reduce((max, supply) => supply > max ? supply : max, 0n)
}

/**
 * Calculates total TVL by:
 * 1. Deduplicating token supplies (tokens can appear in multiple markets)
 * 2. Rolling up child market supplies into parent markets
 * 3. Summing only parent market supplies (to avoid double counting)
 */
function calculateTotalSupply(marketsData) {
  // Step 1: Deduplicate token supplies across markets
  const marketSupplies = new Map()
  const processedTokens = new Set()

  marketsData.forEach(market => {
    const uniqueSupplies = []
    market.wrappedTokens.forEach((token, i) => {
      if (!processedTokens.has(token)) {
        uniqueSupplies.push(market.outcomesSupply[i])
        processedTokens.add(token)
      }
    })
    marketSupplies.set(market.id, uniqueSupplies)
  })

  // Step 2: Roll up child market supplies into parent markets
  marketsData.forEach(market => {
    if (market.parentMarket === ADDRESSES.null) return // Skip parent markets

    const parentSupply = marketSupplies.get(market.parentMarket)
    const childSupply = marketSupplies.get(market.id)

    if (!parentSupply || !childSupply) return

    // Calculate child's effective supply and add to parent's outcome
    const childEffectiveSupply = getEffectiveSupply(market, childSupply)
    const parentOutcome = market.parentOutcome
    parentSupply[parentOutcome] = (parentSupply[parentOutcome] || 0n) + childEffectiveSupply
  })

  // Step 3: Sum up only parent markets (markets with no parent)
  let totalSupply = 0n
  marketsData.forEach(market => {
    if (market.parentMarket !== ADDRESSES.null) return // Skip child markets

    const marketSupply = marketSupplies.get(market.id)
    if (!marketSupply) return

    totalSupply += getEffectiveSupply(market, marketSupply)
  })

  return totalSupply;
}

module.exports = {
  ethereum: { tvl },
  xdai: { tvl },
  methodology: 'TVL represents the total quantity of sDAI held in the conditional tokens contract. The sDAI is withdrawn when the participants merge or redeem their tokens.',
}
