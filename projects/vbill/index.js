const { getTokenSupplies } = require('../helper/solana');

const CONFIG = {
  ethereum: ['0x2255718832bC9fD3bE1CaF75084F4803DA14FF01'], // VBILL
  bsc: ['0x14d72634328C4D03bBA184A48081Df65F1911279'],  // VBILL
  avax: ['0x7F4546eF315Efc65336187Fe3765ea779Ac90183'],     // VBILL
}

const tvl = async (api) => {
  const tokens = CONFIG[api.chain]
  const supplies = await api.multiCall({ calls: tokens, abi: 'erc20:totalSupply' })
  api.add(tokens, supplies)
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})

module.exports.solana = {
  tvl: async (api) => {
    const mints = ['34mJztT9am2jybSukvjNqRjgJBZqHJsHnivArx1P4xy1']
    const res = await getTokenSupplies(mints, api.chain) 
    const supply = res[mints[0]]
    api.add(mints[0], supply)
  }
}