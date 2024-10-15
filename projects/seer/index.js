const config = {
  'ethereum': {
      marketFactory: ['0x1F728c2fD6a3008935c1446a965a313E657b7904'],
      marketView: '0xAb797C4C6022A401c31543E316D3cd04c67a87fC',
      collateralToken: '0x83F20F44975D03b1b09e64809B757c47f942BEeA'
  },
  'gnosis': {
      marketFactory: ['0x83183DA839Ce8228E31Ae41222EaD9EDBb5cDcf1'],
      marketView: '0x995dC9c89B6605a1E8cc028B37cb8e568e27626f',
      collateralToken: '0xaf204776c7245bf4147c2612bf6e5972ee483701'
  },
}

const MARKET_VIEW_ABI =
  'function getMarket(address marketFactory, address market) public view returns (tuple(address id, string marketName, string[] outcomes, address parentMarket, uint256 parentOutcome, address[] wrappedTokens, uint256 outcomesSupply, uint256 lowerBound, uint256 upperBound, bytes32 parentCollectionId, bytes32 conditionId, bytes32 questionId, uint256 templateId, tuple(bytes32 content_hash, address arbitrator, uint32 opening_ts, uint32 timeout, uint32 finalize_ts, bool is_pending_arbitration, uint256 bounty, bytes32 best_answer, bytes32 history_hash, uint256 bond, uint256 min_bond)[] questions, bytes32[] questionsIds, string[] encodedQuestions,bool payoutReported) memory)'

function tvl(chain) {
  return async (api) => {
    // get all markets
    const marketsByFactory = (await Promise.all(config[chain].marketFactory.map(factoryAddress => api.call({
      abi: "function allMarkets() external view returns (address[] memory)",
      target: factoryAddress,
      chain,
    }))));

    /*
     * marketsData is an array of objects with the following structure:
     *  - id
     *  - parentMarket
     *  - parentOutcome
     *  - wrappedTokens
     *  - outcomesSupply
     */
    const marketsData = (await Promise.all(marketsByFactory.map(async (markets, factoryIndex) => {
        return await api.multiCall({
            calls: markets.map(market => ({
                target: config[chain].marketView,
                params: [config[chain].marketFactory[factoryIndex]
                    .target, market
                ]
            })),
            abi: MARKET_VIEW_ABI,
            withMetadata: true,
        })
    }))).map(markets => {
        return markets.map(market => ({
            id: market.output.id,
            parentMarket: market.output.parentMarket,
            parentOutcome: market.output.parentOutcome,
            wrappedTokens: market.output.wrappedTokens,
            outcomesSupply: market.output.wrappedTokens.map(_ => 0n),
        }))
    }).flat();

    /*
     * outcomeTokensSupplyByMarket is an array of totalSupply[] of each outcome token of a market.
     */
    const outcomeTokensSupplyByMarket = (await Promise.all(marketsData.map(marketData => {
        return api.multiCall({
            calls: marketData.wrappedTokens.map(outcomeToken => ({
                target: outcomeToken,
            })),
            abi: 'erc20:totalSupply',
            withMetadata: true,
        })
    }))).map(totalSupplyByMarket => totalSupplyByMarket.map(totalSupllyByOutcome => BigInt(
        totalSupllyByOutcome.output)));

    const totalSupply = calculateTotalSupply(marketsData, outcomeTokensSupplyByMarket);

    api.add(config[chain].collateralToken, totalSupply);
  }
}

/**
 * When a child market is created, the parent market's supply is decreased by the amount used to mint the child market.
 * This function calculates the total supply of parent markets by merging child market supplies into parent markets
 * and summing up the unique supplies. These unique supplies represent the TVL of sDAI backing the parent markets.
 */
function calculateTotalSupply(marketsData, outcomeTokensSupplyByMarket) {
  const marketSupplies = new Map();
  const processedTokens = new Set();

  marketsData.forEach((market, index) => {
    const supply = outcomeTokensSupplyByMarket[index];
    const uniqueSupply = supply.filter((_, i) => !processedTokens.has(market.wrappedTokens[i]));

    uniqueSupply.forEach((_, i) => processedTokens.add(market.wrappedTokens[i]));

    marketSupplies.set(market.id, uniqueSupply);
  });

  // Merge child market supplies into parent markets
  marketsData.forEach((market) => {
    if (market.parentMarket !== '0x0000000000000000000000000000000000000000') {
      const parentSupply = marketSupplies.get(market.parentMarket);
      const childSupply = marketSupplies.get(market.id);

      if (parentSupply && childSupply) {
        // Add child market supply to the corresponding parent outcome
        parentSupply[market.parentOutcome] = (parentSupply[market.parentOutcome] || 0n) + childSupply.reduce((a, b) => a > b ? a : b, 0n);
        marketSupplies.set(market.parentMarket, parentSupply);
      }
    }
  });

  // Calculate total supply of parent markets (parent markets are backed by sDAI)
  let totalSupply = 0n;
  marketsData.forEach((market) => {
    if (market.parentMarket === '0x0000000000000000000000000000000000000000') {
      const marketSupply = marketSupplies.get(market.id);
      if (marketSupply) {
        totalSupply += marketSupply.reduce((a, b) => a > b ? a : b, 0n);
      }
    }
  });

  return totalSupply;
}

module.exports = {
  ethereum: {
      tvl: tvl('ethereum'),
  },
  xdai: {
      tvl: tvl('gnosis'),
  },
  methodology: 'TVL represents the total quantity of sDAI held in the conditional tokens contract. The sDAI is withdrawn when the participants merge or redeem their tokens.',
}
