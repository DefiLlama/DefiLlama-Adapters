const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const { sumTokensExport } = require('../helper/unwrapLPs')

const xnrvAddress = '0x15B9462d4Eb94222a7506Bc7A25FB27a2359291e'
const nrv = "0x42F6f551ae042cBe50C739158b4f0CAC0Edb9096"

const tokens = {
  busd: ADDRESSES.bsc.BUSD,
  usdt: ADDRESSES.bsc.USDT,
  usdc: ADDRESSES.bsc.USDC,
}

const ownerTokens = [
  [
    [tokens.busd, tokens.usdt, tokens.usdc,], '0x1b3771a66ee31180906972580ade9b81afc5fcdc'
  ], 
  [    ['0x54261774905f3e6e9718f2abb10ed6555cae308a', ADDRESSES.bsc.BTCB], '0x6C341938bB75dDe823FAAfe7f446925c66E6270c'  ], 
  [    [ADDRESSES.bsc.ETH, '0x6f817a0ce8f7640add3bc0c1c2298635043c2423'], '0x146CD24dCc9f4EB224DFd010c5Bf2b0D25aFA9C0'  ], 
  [    ['0x07663837218a003e66310a01596af4bf4e44623d'], '0x0eafaa7ed9866c1f08ac21dd0ef3395e910f7114'  ], 
  [    [ADDRESSES.fantom.fUSDT], '0xd0fBF0A224563D5fFc8A57e4fdA6Ae080EbCf3D3'  ], 
  [    ['0x23396cf899ca06c4472205fc903bdb4de249d6fc'], '0x2dcCe1586b1664f41C72206900e404Ec3cA130e0'  ], 
]

module.exports = {
  misrepresentedTokens: true,
  start: '2021-03-01', // March 1, 2021 00:00 AM (UTC)
  bsc:{
    tvl: sumTokensExport({ ownerTokens }),
    staking:staking(xnrvAddress, nrv)
  }
}
