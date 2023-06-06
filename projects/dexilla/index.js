const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  era: {
    exchanges: [
      '0xCA2eE260BFA64D8Fb01B1cd75615aAa42D528214',
      '0x588450db6e3586Ec0468a7Bb36f1d5f3BbbE2084',
      '0x0DE31204e919D71f0E7b9E5766950e99f1017826',
    ],
  },
  optimism: {
    exchanges: [
      '0x189c3f9dcAfe968Be3620cC58274E7c5DF057C7c',
      '0x68D05405472C4f0c254A47922Dba9dbC4CFf2bD9',
      '0x8F1F6751236855391BbBEDBf4Bf5AD7e383E6e50',
    ],
  },
}

module.exports = {
  methodology: 'TVL counts the ERC20 tokens on the exchange contracts.',
  start: 1685610580, // June 1, 2023 @ 9:09:40 (UTC +0)
}

Object.keys(config).forEach(chain => {
  const { exchanges } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const baseTokens = await api.multiCall({  abi: 'address:baseToken', calls: exchanges})
      const quoteTokens = await api.multiCall({  abi: 'address:quoteToken', calls: exchanges})
      return sumTokens2({ api, tokensAndOwners: exchanges.map((v, i) => [[baseTokens[i], v], [quoteTokens[i], v ]]).flat()})
    }
  }
})
