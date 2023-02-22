const { sumTokens2 } = require('../helper/unwrapLPs')

const factory = '0x043c26c2afae80e1c8aa7d341f6f725f4fa9183b'

async function tvl(_, _b, _cb, { api, }) {
  const tokens = await api.call({ abi: 'address[]:getTokens', target: factory })
  const owners = await api.multiCall({ abi: 'function assetOf(address) view returns (address)', target: factory, calls: tokens })
  return sumTokens2({ api, tokensAndOwners: tokens.map((t, i) => ([t, owners[i]])) })
}

module.exports = {
  optimism: {
    tvl,
  },
};
