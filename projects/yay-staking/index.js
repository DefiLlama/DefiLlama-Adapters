const yayStoneAddress = '0xe86142af1321eaac4270422081c1EdA31eEcFf0c'
const yayAgETHAddress = '0x0341d2c2CE65B62aF8887E905245B8CfEA2a3b97'

const tvl = async (api) => {
  return api.sumTokens({
    tokensAndOwners: [
      ['0x7122985656e38bdc0302db86685bb972b145bd3c', yayStoneAddress],
      ['0xe1b4d34e8754600962cd944b535180bd758e6c2e', yayAgETHAddress],
    ]
  })
}

module.exports = {
  start: '2024-08-01',
  ethereum: { tvl },
}