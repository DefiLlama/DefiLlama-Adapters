const { sumTokens2 } = require('../helper/unwrapLPs')

const factory1 = '0x043c26c2afae80e1c8aa7d341f6f725f4fa9183b'
const factory2 = '0x7b5B4c5e381c7Dc116BF9dA8dDd1c96a3bd6C1cb'
const factory3 = '0xF28EFDEc09D15c6e206Ba15E7B4Ce13326d0ca90'

async function tvl1(_, _b, _cb, { api, }) {
  const tokens = await api.call({ abi: 'address[]:getTokens', target: factory1 })
  const owners = await api.multiCall({ abi: 'function assetOf(address) view returns (address)', target: factory1, calls: tokens })
  return sumTokens2({ api, tokensAndOwners: tokens.map((t, i) => ([t, owners[i]])) })
}

async function tvl2(_, _b, _cb, { api, }) {
  const tokens = await api.call({ abi: 'address[]:getTokens', target: factory2 })
  const owners = await api.multiCall({ abi: 'function assetOf(address) view returns (address)', target: factory2, calls: tokens })
  return sumTokens2({ api, tokensAndOwners: tokens.map((t, i) => ([t, owners[i]])) })
}

async function tvl3(_, _b, _cb, { api, }) {
  const tokens = await api.call({ abi: 'address[]:getTokens', target: factory3 })
  const owners = await api.multiCall({ abi: 'function assetOf(address) view returns (address)', target: factory3, calls: tokens })
  return sumTokens2({ api, tokensAndOwners: tokens.map((t, i) => ([t, owners[i]])) })
}

module.exports = {
  optimism: {
    tvl1,
  },
  arbitrum: {
    tvl2,
  },
  kava: {
    tvl3,
  },
};
