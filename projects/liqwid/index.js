const { sumTokensExport } = require('../helper/chain/cardano');
const { graphQuery } = require('../helper/http');

module.exports = {
  cardano: {
    // tvl: sumTokensExport({ scripts: scriptAddresses, }),
    tvl,
    borrowed,
    staking: sumTokensExport({ scripts: ["addr1w8arvq7j9qlrmt0wpdvpp7h4jr4fmfk8l653p9t907v2nsss7w7r4"], }),
    methodology: 'Adds up the Ada in the 16 action tokens and batch final token.'
  }
};

const endpoint = 'https://v2.api.liqwid.finance/graphql'

const queryAdaLoans = `query($input: LoansInput){
  liqwid {
    data {
      loans(input: $input) {
        page
        pagesCount
        results {
          collaterals {
            qTokenAmount
            market {
              id
            }
          }
        }
      }
    }
  }
}
`

const query = `query($input: MarketsInput)  {
  liqwid {
    data {
      markets(input: $input) {
        page
        pagesCount
        results {
          id
          asset {
            id
            currencySymbol
            name
            decimals
          }
          supply
          liquidity
          borrow
          utilization
        }
      }
    }
  }
}
`

const tokenMapping = {
  Ada: 'lovelace',
  DJED: '8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61446a65644d6963726f555344',
  USDM: 'c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d',
  DAI: 'dai',
  USDC: 'usd-coin',
  USDT: 'tether',
}

const getToken = (market) => tokenMapping[market.id] ?? market.asset.currencySymbol + market.asset.name

const getOptimBondTVL = async () => {
  const getLoans = async (pageIndex = 0, collectedLoans = []) => {
    const {
      liqwid: {
        data: { loans },
      },
    } = await graphQuery(endpoint, queryAdaLoans, {
      input: {
        marketIds: 'Ada',
        page: pageIndex,
      },
    })

    const allLoans = [...collectedLoans, ...loans.results]

    // Check if we've reached the last page
    if (pageIndex < loans.pagesCount - 1) {
      return await getLoans(pageIndex + 1, allLoans)
    }

    return allLoans
  }

  const loans = await getLoans()
  const relevantLoans = loans.filter((l) =>
    l.collaterals.some((c) => c.market.id === 'OptimBond1'),
  )
  const bonds = relevantLoans
    .flatMap((l) => l.collaterals)
    .filter((c) => c.market.id === 'OptimBond1')
    .reduce((acc, collateral) => acc + collateral.qTokenAmount, 0)
  return bonds
}

async function tvl(api) {
  const getMarkets = async (pageIndex = 0, collectedMarkets = []) => {
    const {
      liqwid: {
        data: { markets },
      },
    } = await graphQuery(endpoint, query, {
      input: {
        page: pageIndex,
      },
    })

    const allMarkets = [...collectedMarkets, ...markets.results]

    // Check if we've reached the last page
    if (pageIndex < markets.pagesCount - 1) {
      return await getMarkets(pageIndex + 1, allMarkets)
    }

    return allMarkets
  }

  const markets = await getMarkets()
  markets.forEach((market) =>
    add(api, market, market.liquidity * 10 ** market.asset.decimals),
  )
  add(api, "OptimBond1", await getOptimBondTVL())
}

function add(api, market, bal) {
  const token = market === "OptimBond1" ? "OptimBond1" : getToken(market)
  if (["usd-coin", "tether",].includes(token)) bal /= 1e8
  if (["dai",].includes(token)) bal /= 1e6
  api.add(token, bal, {
    skipChain: ['usd-coin', 'tether', 'dai'].includes(token)
  })
}

async function borrowed(api) {
  const getMarkets = async (pageIndex = 0, collectedMarkets = []) => {
    const {
      liqwid: {
        data: { markets },
      },
    } = await graphQuery(endpoint, query, {
      input: {
        page: pageIndex,
      },
    })

    const allMarkets = [...collectedMarkets, ...markets.results]

    // Check if we've reached the last page
    if (pageIndex < markets.pagesCount - 1) {
      return await getMarkets(pageIndex + 1, allMarkets)
    }

    return allMarkets
  }

  const markets = await getMarkets()
  markets.forEach((market) => {
    add(api, market, market.borrow * 10 ** market.asset.decimals)
  })
}
