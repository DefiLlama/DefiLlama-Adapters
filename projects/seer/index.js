const { getLogs } = require('../helper/cache/getLogs')

const config = {
  'ethereum': {
    marketFactory: [
      { target: '0x1F728c2fD6a3008935c1446a965a313E657b7904', fromBlock: 20894990 },
    ],
    conditionalTokens: '0xC59b0e4De5F1248C1140964E0fF287B192407E0C',
    collateralToken: '0x83F20F44975D03b1b09e64809B757c47f942BEeA'
  },
  'gnosis': {
    marketFactory: [
      { target: '0x83183DA839Ce8228E31Ae41222EaD9EDBb5cDcf1', fromBlock: 36404701 },
    ],
    conditionalTokens: '0xCeAfDD6bc0bEF976fdCd1112955828E00543c0Ce',
    collateralToken: '0xaf204776c7245bf4147c2612bf6e5972ee483701'
  },
}

const EVENT_ABIS = {
  NewMarket: 'event NewMarket(address indexed market, string marketName, address parentMarket, bytes32 conditionId, bytes32 questionId, bytes32[] questionsIds)',
  PositionSplit: 'event PositionSplit(address indexed stakeholder, address collateralToken, bytes32 indexed parentCollectionId, bytes32 indexed conditionId, uint256[] partition, uint256 amount)',
  PositionsMerge: 'event PositionsMerge(address indexed stakeholder, address collateralToken, bytes32 indexed parentCollectionId, bytes32 indexed conditionId, uint256[] partition, uint256 amount)',
  PayoutRedemption: 'event PayoutRedemption(address indexed redeemer, address indexed collateralToken, bytes32 indexed parentCollectionId, bytes32 conditionId, uint256[] indexSets, uint256 payout)',
}

function tvl(chain) {
  const sumConditionalTokensEventAmount = async (api, conditionIds, extraKey, eventAbi) => {
      return (await getLogs({
          api,
          target: config[chain].conditionalTokens,
          fromBlock: config[chain].marketFactory[0].fromBlock,
          extraKey,
          eventAbi,
          onlyArgs: true
      })).filter(args => 
          conditionIds.includes(args[3]) 
          // exclude contingent markets as they are minted using a parent market outcome
          && args[2] === '0x0000000000000000000000000000000000000000000000000000000000000000'
      ).reduce((acum, curr) => acum + curr[5], 0n)
  }

  return async (api) => {
      // get seer conditionIds
      const conditionIds = (await Promise.all(config[chain].marketFactory.map(({
          target,
          fromBlock
      }) => getLogs({
          api,
          target,
          fromBlock,
          eventAbi: EVENT_ABIS.NewMarket
      })))).flat().map(log => log.args[3])

      // get amount of collateral deposited by seer markets
      const splitAmount = await sumConditionalTokensEventAmount(api, conditionIds, 'split',
          EVENT_ABIS.PositionSplit
      );
      // get amount of colateral merged by seer markets
      const mergeAmount = await sumConditionalTokensEventAmount(api, conditionIds, 'merge',
          EVENT_ABIS.PositionsMerge
      )
      // get amount of colateral redeemed by seer markets
      const redeemAmount = await sumConditionalTokensEventAmount(api, conditionIds, 'redeem',
          EVENT_ABIS.PayoutRedemption
      );

      api.add(config[chain].collateralToken, splitAmount - mergeAmount - redeemAmount);
  }
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
