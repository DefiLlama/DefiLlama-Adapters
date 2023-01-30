const { staking } = require('../helper/staking')
const { sumTokensExport } = require('../helper/unwrapLPs')

const xnrvAddress = '0x15B9462d4Eb94222a7506Bc7A25FB27a2359291e'
const nrv = "0x42F6f551ae042cBe50C739158b4f0CAC0Edb9096"

const tokens = {
  busd: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
  usdt: '0x55d398326f99059ff775485246999027b3197955',
  usdc: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
}

const ownerTokens = [
  [
    [tokens.busd, tokens.usdt, tokens.usdc,], '0x1b3771a66ee31180906972580ade9b81afc5fcdc'
  ], 
  [    ['0x54261774905f3e6e9718f2abb10ed6555cae308a', '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c'], '0x6C341938bB75dDe823FAAfe7f446925c66E6270c'  ], 
  [    ['0x2170ed0880ac9a755fd29b2688956bd959f933f8', '0x6f817a0ce8f7640add3bc0c1c2298635043c2423'], '0x146CD24dCc9f4EB224DFd010c5Bf2b0D25aFA9C0'  ], 
  [    ['0x07663837218a003e66310a01596af4bf4e44623d'], '0x0eafaa7ed9866c1f08ac21dd0ef3395e910f7114'  ], 
  [    ['0x049d68029688eabf473097a2fc38ef61633a3c7a'], '0xd0fBF0A224563D5fFc8A57e4fdA6Ae080EbCf3D3'  ], 
  [    ['0x23396cf899ca06c4472205fc903bdb4de249d6fc'], '0x2dcCe1586b1664f41C72206900e404Ec3cA130e0'  ], 
]

module.exports = {
  misrepresentedTokens: true,
  start: 1614556800, // March 1, 2021 00:00 AM (UTC)
  bsc:{
    tvl: sumTokensExport({ ownerTokens }),
    staking:staking(xnrvAddress, nrv, "bsc")
  }
}
