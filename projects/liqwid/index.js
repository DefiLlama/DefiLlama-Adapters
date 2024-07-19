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


const endpoint = 'https://api.liqwid.finance/graphql'

const queryAdaLoans = `query ($page: Int) {
  Page (page: $page) {
    pageInfo {
      currentPage
      hasNextPage
    }
    loan(marketId: "Ada") {
      collaterals {
        id
        amount
      }
    }
  }
}
`

const query = `query ($page: Int) {
  Page (page: $page) {
    pageInfo {
      currentPage
      hasNextPage
    }
    market {
      asset {
        marketId
        name
        qTokenId
        qTokenPolicyId
      }
      state {
        totalSupply
        utilization
      }
      marketId
      decimals
      info {
        params {
          underlyingClass {
            value0 {
              symbol
              name
            }
          }
        }
        scripts {
          actionToken {
            script {
              value0 {
                value0
              }
            }
          }
        }
      }
    }
  }
}
`
const tokenMapping = {
  ADA: 'lovelace',
  DJED: '8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61446a65644d6963726f555344',
  DAI: 'dai',

}

const getToken = market => tokenMapping[market.marketId.toUpperCase()] ?? market.info.params.underlyingClass.value0.symbol + toHex(market.info.params.underlyingClass.value0.name)

const getOptimBondTVL = async () => {
  const getLoans = async (pageIndex) => {
    const { Page: { pageInfo, loan: loans } } = await graphQuery(endpoint, queryAdaLoans, { page: pageIndex })

    if (!pageInfo.hasNextPage) {
      return loans
    }
    return [...loans, ...(await getLoans(pageIndex + 1))]
  }
  const loans = await getLoans(0)
  const relevantLoans =
    loans.filter(l => (l.collaterals.filter(c => c.id === "OptimBond1")).length != 0)
  const bonds =
    relevantLoans.map(l => l.collaterals[0].amount).reduce((acc, amount) =>
      acc + Number(amount), 0)

  return bonds
}

async function tvl(api) {
  const { Page: { market: markets } } = await graphQuery(endpoint, query, { page: 0 })

  markets.forEach(market => add(api, market, market.state.totalSupply))
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
  const { Page: { market: markets } } = await graphQuery(endpoint, query)

  markets.forEach(market => {
    const utilization = market.state.utilization
    const availability = 1 - utilization
    const totalBorrowed = market.state.totalSupply * utilization / availability
    add(api, market, totalBorrowed)
  })
}

function base64ToHex(base64) {
  return base64
  /* // Step 1: Decode the Base64 string to a byte array
  const binaryData = atob(base64);

  // Step 2: Convert each byte to its hexadecimal representation
  const hexArray = [];
  for (let i = 0; i < binaryData.length; i++) {
    const byte = binaryData.charCodeAt(i).toString(16).padStart(2, '0');
    hexArray.push(byte);
  }

  // Step 3: Concatenate the hexadecimal values to form the final hexadecimal string
  return hexArray.join(''); */
}

function toHex(str) {
  let hex = ''
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16);
  }
  return hex
}