const { getConfig } = require('../helper/cache')
const { getAddress } = require('ethers')

const abi = {
  asset: "address:asset",
  totalAssets: "uint256:totalAssets",
}

async function tvl(api) {
  const { data: { list: products } } = await getConfig('lista/rwa', 'https://api.lista.org/api/rwa/product/list')
  
  const contracts = products.map(p => getAddress(p.contract))
  
  const assets = await api.multiCall({ calls: contracts, abi: abi.asset })
  const totalAssets = await api.multiCall({ calls: contracts, abi: abi.totalAssets })
  
  for (let i = 0; i < contracts.length; i++) {
    api.add(assets[i], totalAssets[i])
  }
}

module.exports = {
  methodology: "TVL is calculated by summing the totalAssets of all RWA products",
  bsc: {
    tvl,
  },
}

