const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  optimism: '0x043c26c2afae80e1c8aa7d341f6f725f4fa9183b',
  arbitrum: '0x7b5B4c5e381c7Dc116BF9dA8dDd1c96a3bd6C1cb',
  kava: '0xF28EFDEc09D15c6e206Ba15E7B4Ce13326d0ca90',
}

module.exports = {
  hallmarks: [
    [1680134400, "Rugpull"]
  ]
};

Object.keys(config).forEach(chain => { module.exports[chain] = {tvl} })

async function tvl(_, _b, _cb, { api, }) {
  const factory = config[api.chain]
  const tokens = await api.call({ abi: 'address[]:getTokens', target: factory })
  const owners = await api.multiCall({ abi: 'function assetOf(address) view returns (address)', target: factory, calls: tokens })
  return sumTokens2({ api, tokensAndOwners: tokens.map((t, i) => ([t, owners[i]])) })
}
