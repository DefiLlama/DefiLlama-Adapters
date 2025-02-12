const ADDRESSES = require('../helper/coreAssets.json')
const config = {
  'ethereum': {
    marketFactory: ['0x1F728c2fD6a3008935c1446a965a313E657b7904'],
    marketView: '0xAb797C4C6022A401c31543E316D3cd04c67a87fC',
    collateralToken: ADDRESSES.ethereum.SDAI
  },
  'xdai': {
    marketFactory: ['0x83183DA839Ce8228E31Ae41222EaD9EDBb5cDcf1'],
    marketView: '0x995dC9c89B6605a1E8cc028B37cb8e568e27626f',
    collateralToken: ADDRESSES.xdai.SDAI
  },
}

const MARKET_VIEW_ABI =
  'function getMarket(address marketFactory, address market) public view returns (tuple(address id, string marketName, string[] outcomes, address parentMarket, uint256 parentOutcome, address[] wrappedTokens, uint256 outcomesSupply, uint256 lowerBound, uint256 upperBound, bytes32 parentCollectionId, bytes32 conditionId, bytes32 questionId, uint256 templateId, tuple(bytes32 content_hash, address arbitrator, uint32 opening_ts, uint32 timeout, uint32 finalize_ts, bool is_pending_arbitration, uint256 bounty, bytes32 best_answer, bytes32 history_hash, uint256 bond, uint256 min_bond)[] questions, bytes32[] questionsIds, string[] encodedQuestions,bool payoutReported) memory)'

async function tvl(api) {
  const { marketFactory, marketView, collateralToken } = config[api.chain]
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
  */
  const marketsData = (await api.multiCall({ abi: MARKET_VIEW_ABI, calls: dataCalls, target: marketView })).map(market => ({
    id: market.id,
    parentMarket: market.parentMarket,
    parentOutcome: market.parentOutcome,
    wrappedTokens: market.wrappedTokens,
    outcomesSupply: (market.wrappedTokens ?? []).map(_ => 0),
  }))

  const idIndexMapping = []
  const supplyCalls = []
  marketsData.forEach((marketData, index) => {
    marketData.wrappedTokens.forEach((outcomeToken, idx2) => {
      idIndexMapping.push([index, idx2])
      supplyCalls.push(outcomeToken)
    })
  })

  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: supplyCalls })
  supplies.forEach((supply, i) => {
    const [marketIndex, outcomeIndex] = idIndexMapping[i]
    marketsData[marketIndex].outcomesSupply[outcomeIndex] = +supply
  })

  const totalSupply = calculateTotalSupply(marketsData);

  api.add(collateralToken, totalSupply);
}

/**
 * When a child market is created, the parent market's supply is decreased by the amount used to mint the child market.
 * This function calculates the total supply of parent markets by merging child market supplies into parent markets
 * and summing up the unique supplies. These unique supplies represent the TVL of sDAI backing the parent markets.
 */
function calculateTotalSupply(marketsData) {
  const marketSupplies = new Map();
  const processedTokens = new Set();

  marketsData.forEach((market, index) => {
    const supply = market.outcomesSupply
    const uniqueSupply = []
    let i = 0
    for (const token of market.wrappedTokens) {
      if (!processedTokens.has(token)) {
        uniqueSupply.push(supply[i])
        processedTokens.add(token)
      }
      i++
    }

    marketSupplies.set(market.id, uniqueSupply);
  });

  // Merge child market supplies into parent markets
  marketsData.forEach((market) => {
    if (market.parentMarket !== ADDRESSES.null) {
      const parentSupply = marketSupplies.get(market.parentMarket);
      const childSupply = marketSupplies.get(market.id);

      if (parentSupply && childSupply) {
        // Add child market supply to the corresponding parent outcome
        parentSupply[market.parentOutcome] = (parentSupply[market.parentOutcome] || 0) + childSupply.reduce((a, b) => a > b ? a : b, 0);
        marketSupplies.set(market.parentMarket, parentSupply);
      }
    }
  });

  // Calculate total supply of parent markets (parent markets are backed by sDAI)
  let totalSupply = 0;
  marketsData.forEach((market) => {
    if (market.parentMarket === ADDRESSES.null) {
      const marketSupply = marketSupplies.get(market.id);
      if (marketSupply) {
        totalSupply += marketSupply.reduce((a, b) => a > b ? a : b, 0);
      }
    }
  });

  return totalSupply;
}

module.exports = {
  ethereum: { tvl },
  xdai: { tvl },
  methodology: 'TVL represents the total quantity of sDAI held in the conditional tokens contract. The sDAI is withdrawn when the participants merge or redeem their tokens.',
}
