const { graphQuery } = require('../helper/http');
const { sumTokens2 } = require('../helper/unwrapLPs');

const endpoint = 'https://cache-service.chainflip.io/graphql'

async function tvl(api) {
  const {
    allLendingPools: { nodes },
    allLpCollateralBalances: { groupedAggregates },
  } = await graphQuery(endpoint, `{
    allLendingPools {
      nodes {
        asset
        totalAvailableAmount
      }
    }
    allLpCollateralBalances {
      groupedAggregates(groupBy: ASSET) {
        sum {
          amount
        }
        keys
      }
    }
  }`)

  // available (not borrowed) lending supply — DefiLlama computes Supplied = TVL + Borrowed
  nodes.forEach(pool => {
    api.add(pool.asset, pool.totalAvailableAmount)
  })
  groupedAggregates.forEach(i => {
    api.add(i.keys[0], i.sum.amount)
  })

  return sumTokens2({ api })
}

async function borrowed(api) {
  const { allLendingPools: { nodes } } = await graphQuery(endpoint, `{
    allLendingPools {
      nodes {
        asset
        totalBorrowedAmount
      }
    }
  }`)

  nodes.forEach(pool => {
    api.add(pool.asset, pool.totalBorrowedAmount)
  })

  return sumTokens2({ api })
}

module.exports = {
  methodology: 'TVL is the available (not yet borrowed) lending supply plus collateral deposited by borrowers. Borrowed is the total outstanding loan principal. Supplied (TVL + Borrowed) equals the total assets deposited by lenders plus collateral.',
  timetravel: false,
  chainflip: {
    tvl,
    borrowed,
  }
}
