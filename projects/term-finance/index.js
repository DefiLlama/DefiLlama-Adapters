const { cachedGraphQuery } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs');
const { getLogs } = require('../helper/cache/getLogs')

const graphs = {
  ethereum:
    "https://graphql-gateway-term.mainnet.mainnet.termfinance.io/graphql",
  avax:
    "https://graphql-gateway-term.avalanche.mainnet.termfinance.io/graphql",
};

const query = `
query poolQuery($lastId: ID) {
  termRepoCollaterals(
    first: 1000,
    where: {
      id_gt: $lastId,
      term_: { delisted: false }
    }
  ) {
    id
    term { termRepoLocker }
    collateralToken
  }
}`

const purchaseTokensQuery = `
query purchaseTokensQuery($lastId: ID) {
  termAuctions(
    first: 1000,
    where: {
      id_gt: $lastId,
      term_: { delisted: false },
      delisted: false
    }
  ) {
    id
    term {
      id
      purchaseToken
    }
  }
}`

const startBlocks = {
  "ethereum": 16380765,
  "avax": 43162228,
};
const emitters = {
  "ethereum": [
    "0x9D6a563cf79d47f32cE46CD7b1fb926eCd0f6160",  // 0.2.4
    "0xf268E547BC77719734e83d0649ffbC25a8Ff4DB3",  // 0.4.1
    "0xc60e0f5cD9EE7ACd22dB42F7f56A67611ab6429F",  // 0.6.0
    "0x4C6Aeb4E8dBBAF53c13AF495c847D4eC68994bD4",  // 0.9.0
  ],
  "avax": [
    "0xb81afB6724ba9d19a3572Fb29ed7ef633fD50093",  // 0.6.0
  ],
};

module.exports = {
  methodology: `Counts the collateral tokens locked in Term Finance's term repos.`,
  // hallmarks: [[1588610042, "TermFinance Launch"]],
};

Object.keys(graphs).forEach(chain => {
  const host = graphs[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const data = await cachedGraphQuery(`term-finance-${chain}`, host, query, { fetchById: true })
      return sumTokens2({ api, tokensAndOwners: data.map(i => [i.collateralToken, i.term.termRepoLocker]), permitFailure: true })
    },
    borrowed: async (api) => {
      const tokenData = await cachedGraphQuery(`term-finance-purchase-tokens-${chain}`, host, purchaseTokensQuery, { fetchById: true })

      const purchaseTokensByTermId = {};
      for (const { term: { id, purchaseToken } } of tokenData) {
        purchaseTokensByTermId[id] = purchaseToken
      }

      for (const eventEmitter of emitters[chain] ?? []) {
        // First handle events that add to the balance
        const bidFulfilledLogs = await getLogs({
          api,
          target: eventEmitter,
          eventAbi: 'event BidFulfilled(bytes32 termRepoId, address bidder, uint256 purchasePrice, uint256 repurchasePrice, uint256 servicingFees)',
          onlyArgs: true,
          fromBlock: startBlocks[chain],
        })
        for (const { termRepoId, repurchasePrice } of bidFulfilledLogs) {
          api.add(purchaseTokensByTermId[termRepoId], repurchasePrice)
        }

        const exposureOpenedOnRolloverNewLogs = await getLogs({
          api,
          target: eventEmitter,
          eventAbi: 'event ExposureOpenedOnRolloverNew(bytes32 termRepoId, address borrower, uint256 purchasePrice, uint256 repurchasePrice, uint256 servicingFees)',
          onlyArgs: true,
          fromBlock: startBlocks[chain],
        })
        for (const { termRepoId, repurchasePrice } of exposureOpenedOnRolloverNewLogs) {
          api.add(purchaseTokensByTermId[termRepoId], repurchasePrice)
        }

        // Then handle events that subtract from the balance
        const liquidationLogs = await getLogs({
          api,
          target: eventEmitter,
          eventAbi: 'event Liquidation(bytes32 termRepoId, address borrower, address liquidator, uint256 closureAmount, address collateralToken, uint256 amountLiquidated, uint256 protocolSeizureAmount, bool defaultLiquidation)',
          onlyArgs: true,
          fromBlock: startBlocks[chain],
        })
        for (const { termRepoId, closureAmount } of liquidationLogs) {
          api.add(purchaseTokensByTermId[termRepoId], -closureAmount)
        }
        
        const repurchasePaymentSubmittedLogs = await getLogs({
          api,
          target: eventEmitter,
          eventAbi: 'event RepurchasePaymentSubmitted(bytes32 termRepoId, address borrower, uint256 repurchaseAmount)',
          onlyArgs: true,
          fromBlock: startBlocks[chain],
        })
        for (const { termRepoId, repurchaseAmount } of repurchasePaymentSubmittedLogs) {
          api.add(purchaseTokensByTermId[termRepoId], -repurchaseAmount)
        }

        const burnCollapseExposureLogs = await getLogs({
          api,
          target: eventEmitter,
          eventAbi: 'event BurnCollapseExposure(bytes32 termRepoId, address borrower, uint256 amountToClose)',
          onlyArgs: true,
          fromBlock: startBlocks[chain],
        })
        for (const { termRepoId, amountToClose } of burnCollapseExposureLogs) {
          api.add(purchaseTokensByTermId[termRepoId], -amountToClose)
        }

        const exposureClosedOnRolloverExistingLogs = await getLogs({
          api,
          target: eventEmitter,
          eventAbi: 'event ExposureClosedOnRolloverExisting(bytes32 termRepoId, address borrower, uint256 amountRolled)',
          onlyArgs: true,
          fromBlock: startBlocks[chain],
        })
        for (const { termRepoId, amountRolled } of exposureClosedOnRolloverExistingLogs) {
          api.add(purchaseTokensByTermId[termRepoId], -amountRolled)
        }
      }

      return api.getBalances()
    }
  }
})
