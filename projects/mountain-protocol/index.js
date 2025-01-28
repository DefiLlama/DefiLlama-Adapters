const ADDRESSES = require('../helper/coreAssets.json')

const USDM = {
  ethereum: ADDRESSES.ethereum.USDM,
  polygon: ADDRESSES.ethereum.USDM,
  optimism: ADDRESSES.ethereum.USDM,
  base: ADDRESSES.ethereum.USDM,
  arbitrum: ADDRESSES.ethereum.USDM,
  era: ADDRESSES.era.USDM
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Calculates the total USDM Supply",
}

const tvl = async (api) => {
  const supply = await api.call({ target: USDM[api.chain], abi: 'erc20:totalSupply' })
  api.add(USDM[api.chain], supply)
}

Object.keys(USDM).forEach((chain) => {
  module.exports[chain] = { tvl }
})
