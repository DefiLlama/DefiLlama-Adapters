const { getResource } = require('../helper/chain/aptos')
const { getTokenSupplies } = require('../helper/solana');

const BUIDL_APTOS_METADATA = '0x50038be55be5b964cfa32cf128b5cf05f123959f286b4cc02b86cafd48945f89'

const CONFIG = {
  ethereum: [
    '0x7712c34205737192402172409a8f7ccef8aa2aec',           // BUIDL
    '0x6a9DA2D710BB9B700acde7Cb81F10F1fF8C89041'            // BUIDL-I
  ],
  polygon: ['0x2893ef551b6dd69f661ac00f11d93e5dc5dc0e99'],  // BUIDL
  avax: ['0x53fc82f14f009009b440a706e31c9021e1196a2f'],     // BUIDL
  optimism: ['0xa1cdab15bba75a80df4089cafba013e376957cf5'], // BUIDL
  arbitrum: ['0xa6525ae43edcd03dc08e775774dcabd3bb925872'], // BUIDL
  bsc: ['0x2d5bdc96d9c8aabbdb38c9a27398513e7e5ef84f'], // BNB
  tempo: ['0xb5ff12bd8010baef823d1bfa2ce6bdc0109cbb24'], // BUIDL
}

const tvl = async (api) => {
  const tokens = CONFIG[api.chain]
  const supplies = await api.multiCall({ calls: tokens, abi: 'erc20:totalSupply' })
  api.add(tokens, supplies)
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})

module.exports.aptos = {
  tvl: async (api) => {
    // live circulating supply of the fungible asset
    const res = await getResource(BUIDL_APTOS_METADATA, '0x1::fungible_asset::ConcurrentSupply', api.chain)
    api.add('ethereum:0x7712c34205737192402172409a8f7ccef8aa2aec', res.current.value, { skipChain: true })
  }
}


module.exports.solana = {
  tvl: async (api) => {
    const mints = ['GyWgeqpy5GueU2YbkE8xqUeVEokCMMCEeUrfbtMw6phr']
    await getTokenSupplies(mints, { api })
  }
}

module.exports.methodology = 'Counts the live circulating supply of each BlackRock USD Institutional Digital Liquidity Fund (BUIDL) share class on every chain it is issued on. EVM chains read erc20:totalSupply of the share-class token (BUIDL, plus BUIDL-I on Ethereum); Aptos reads 0x1::fungible_asset::ConcurrentSupply of the BUIDL metadata object; Solana reads the SPL mint supply.'
