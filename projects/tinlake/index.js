const ADDRESSES = require('../helper/coreAssets.json')
const BigNumber = require("bignumber.js");
const { graphQuery } = require('../helper/http')
const data = {}

const subgraphUrl = 'https://graph.centrifuge.io/tinlake/subgraphs/name/allow-null-maturity-date';
const graphTotalTokenTVLQuery = `
query GET_TOTAL_TOKEN_TVL {
  pools(
    first: 1000
  ) {
    id
    assetValue
    reserve
  }
}
`;
const dai = ADDRESSES.ethereum.DAI

async function getData(api) {
  return graphQuery(subgraphUrl, graphTotalTokenTVLQuery, { api, })
}

async function borrowed(timestamp, ethBlock, _, {api }) {
  let total = BigNumber(0)
  if (!data[ethBlock]) data[ethBlock] = await getData(api)
  const { pools } = await data[ethBlock]
  pools.forEach(pool => {
    total = total.plus(pool.assetValue)
  })

  return {
    [dai]: total.toFixed(0)
  }
}

async function tvl(timestamp, ethBlock, _, {api }) {
  let total = BigNumber(0)
  if (!data[ethBlock]) data[ethBlock] = await getData(api)
  const { pools } = await data[ethBlock]
  pools.forEach(pool => {
    total = total.plus(pool.reserve)
  })

  return {
    [dai]: total.toFixed(0)
  }
}



module.exports = {
  timetravel: false,
  methodology: 'TVL consist of the sum of every pool. The pool value is made up of the NAV (the value of the assets in the pool) and the Pool Reserve (undeployed capital in the pool). The Tinlake subgraph is used to pull the assetValue and reserve values of each pool.',
  ethereum: {
    tvl,
    borrowed,
  }
}

