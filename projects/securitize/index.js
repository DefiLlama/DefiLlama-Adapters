const ADDRESSES = require('../helper/coreAssets.json')

const BUIDL = {
  ethereum: '0x7712c34205737192402172409a8f7ccef8aa2aec',
  polygon: '0x2893ef551b6dd69f661ac00f11d93e5dc5dc0e99',
  avax: '0x53fc82f14f009009b440a706e31c9021e1196a2f',
  optimism: '0xa1cdab15bba75a80df4089cafba013e376957cf5',
  arbitrum: '0xa6525ae43edcd03dc08e775774dcabd3bb925872',
}

Object.keys(BUIDL).forEach((chain) => {
  module.exports[chain] = { tvl: async (api) => { api.add(ADDRESSES.ethereum.USDC, await api.call({ target: BUIDL[chain], abi: 'erc20:totalSupply' }), { skipChain: true }) } }
})
