const axios = require("axios")
const ADDRESSES = require('../helper/coreAssets.json')

const unifiAvsSubgraphUrl = 'https://api.studio.thegraph.com/query/90587/unifiavs/version/latest'

async function tvl(api) {
  const query = `{
    totalShares(id: 1) {
      id
      totalEigenShares
      totalShares
    }
  }`

  const response = await axios.post(unifiAvsSubgraphUrl, { query })
  const { totalShares, totalEigenShares } = response.data.data.totalShares || {}

  api.add(ADDRESSES.ethereum.WETH, totalShares)
  api.add(ADDRESSES.ethereum.EIGEN, totalEigenShares)
}

module.exports = {
  doublecounted: true,
  methodology: 'Query the UniFi AVS subgraph to get the total shares and total eigen shares in the WETH and EIGEN base tokens.',
  ethereum: { tvl }
};
