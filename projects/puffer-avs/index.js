const { request, gql } = require('graphql-request')
const ADDRESSES = require('../helper/coreAssets.json')

const unifiAvsSubgraphUrl = 'https://api.studio.thegraph.com/query/90587/unifiavs/version/latest'

async function tvl(api) {
  const query = gql`{
    totalShares(id: 1) {
      id
      totalEigenShares
      totalShares
    }
  }`

  const response = await request(unifiAvsSubgraphUrl, query)
  const { totalShares, totalEigenShares } = response.totalShares || {}

  api.add(ADDRESSES.ethereum.WETH, totalShares)
  api.add(ADDRESSES.ethereum.EIGEN, totalEigenShares)
}

module.exports = {
  doublecounted: true,
  methodology: 'Query the UniFi AVS subgraph to get the total shares and total eigen shares in the WETH and EIGEN base tokens.',
  ethereum: { tvl }
};
