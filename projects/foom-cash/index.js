const { sumTokensExport } = require('../helper/unwrapLPs.js')

const tokens = {
    ethereum: {
      FOOM: '0xd0D56273290D339aaF1417D9bfa1bb8cFe8A0933'
    },
    base: {
      FOOM: '0x02300ac24838570012027e0a90d3feccef3c51d2'
    },
};

const config = {
  ethereum: [
    {
      tokens: [tokens.ethereum.FOOM],
      holders: [
        "0x239AF915abcD0a5DCB8566e863088423831951f8",
      ],
    },
  ],
  base: [
    {
      tokens: [tokens.base.FOOM],
      holders: [
        "0xdb203504ba1fea79164AF3CeFFBA88C59Ee8aAfD",
      ],
    },
  ],
};

Object.keys(config).forEach(chain => {
  const tokensAndOwners = config[chain]
    .map(({ tokens, holders }) =>
      holders.flatMap(o => tokens.map(t => [t, o]))
    )
    .flat()

  module.exports[chain] = {
    tvl: () => ({}),
    staking: sumTokensExport({ tokensAndOwners }),
  }
})
