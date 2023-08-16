const { cachedGraphQuery } = require('../helper/cache')

const graphs = {
  ethereum:
    "https://api.studio.thegraph.com/query/33765/term-finance-mainnet/version/latest",
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

module.exports = {
  methodology: `Counts the collateral tokens locked in Term Finance's term repos.`,
  // hallmarks: [[1588610042, "TermFinance Launch"]],
};

Object.keys(graphs).forEach(chain => {
  const host = graphs[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const data = await cachedGraphQuery(`term-finance-${chain}`, host, query, { fetchById: true })
      return api.sumTokens( { tokensAndOwners: data.map(i => [i.collateralToken, i.term.termRepoLocker])})
    }
  }
})
