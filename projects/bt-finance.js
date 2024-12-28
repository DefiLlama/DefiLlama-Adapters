const { sumTokensExport } = require('./helper/unwrapLPs')


async function tvl(api) {
  return api.sumTokens({
    tokensAndOwners: [
      ['0xd662908ada2ea1916b3318327a97eb18ad588b5d', '0xa7971b65d86020366e4b9a28e4089bc5b12481af'],
      ['0xd662908ADA2Ea1916B3318327A97eB18aD588b5d', '0xa7971b65d86020366e4b9a28e4089bc5b12481af'],
    ]
  })
}
module.exports = {
  ethereum: {
    tvl: () => ({}),
    // staking: sumTokensExport({ owner: '0x5ae55a3249817B77cc88159dA912015c6a2c49Ed', tokens: ['0x76c5449F4950f6338A393F53CdA8b53B0cd3Ca3a']})
  },
  deadFrom: '2022-01-01'
}
