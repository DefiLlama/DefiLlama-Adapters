const { cachedGraphQuery } = require('../helper/cache')
const { getLogs } = require('../helper/cache/getLogs')

const graphs = {
  ethereum:
    "https://graph-node.mainnet.termfinance.io/subgraphs/name/term-finance-mainnet",
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
    term { termRepoLocker }
    collateralToken
  }
}`

const borrowedQuery = `
query auctionsQuery($lastId: ID) {
  termAuctions(
    first: 1000,
    where: {
      id_gt: $lastId,
    }
  ) {
    id
    auction
    term {
      purchaseToken
    }
  }
}`

const startBlocks = {
  "ethereum": 16380765,
  "avalanche": 43162228,
};
const emitters = {
  "ethereum": [
    "0x9D6a563cf79d47f32cE46CD7b1fb926eCd0f6160",  // 0.2.4
    "0xf268E547BC77719734e83d0649ffbC25a8Ff4DB3",  // 0.4.1
    "0xc60e0f5cD9EE7ACd22dB42F7f56A67611ab6429F",  // 0.6.0
  ],
  "avalanche": [
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
      return api.sumTokens( { tokensAndOwners: data.map(i => [i.collateralToken, i.term.termRepoLocker])})
    },
    borrowed: async (api) => {
      const data = await cachedGraphQuery(`term-finance-borrowed-${chain}`, host, borrowedQuery, { fetchById: true })

      for (const eventEmitter of emitters[chain] ?? []) {
        const logs = await getLogs({
          api,
          target: eventEmitter,
          eventAbi: 'event BidAssigned(bytes32 termAuctionId, bytes32 id, uint256 amount)',
          onlyArgs: true,
          fromBlock: startBlocks[chain],
        })
        for (const { termAuctionId, amount } of logs) {
          const { term: { purchaseToken } } = data.find(i => i.id === termAuctionId)
          api.add(purchaseToken, amount)
        }
      }

      return api.getBalances()
    }
  }
})
