const ADDRESSES = require('../helper/coreAssets.json')
const BigNumber = require("bignumber.js");
const { graphQuery } = require('../helper/http')
const data = {}

const subgraphUrl = 'https://api.goldsky.com/api/public/project_clhi43ef5g4rw49zwftsvd2ks/subgraphs/main/prod/gn';
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
  return graphQuery(subgraphUrl, graphTotalTokenTVLQuery, {}, { api, })
}

async function borrowed(api) {
  let total = BigNumber(0)
  const ethBlock = await api.getBlock()
  if (!data[ethBlock]) data[ethBlock] = await getData(api)
  const { pools } = await data[ethBlock]
  pools.forEach(pool => {
    total = total.plus(pool.assetValue)
  })

  return {
    [dai]: total.toFixed(0)
  }
}

async function tvl(api) {
  let total = BigNumber(0)
  const ethBlock = await api.getBlock()
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

