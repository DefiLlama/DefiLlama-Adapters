const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokens2, nullAddress, sumTokensExport } = require('./helper/unwrapLPs')

const HAKKA_ADDRESSES = {
  1: '0x0E29e5AbbB5FD88e28b2d355774e73BD47dE3bcd',
  56: '0x1d1eb8e8293222e1a29d2c0e4ce6c0acfd89aaac',
}
const thirdFloorAddress = '0x66be1bc6C6aF47900BBD4F3711801bE6C2c6CB32'
const BHS_USDC_DAI_HAKKA_BPT = '0x1B8874BaceAAfba9eA194a625d12E8b270D77016'
const BHS_USDC_DAI_HAKKA_POOL = '0x6EE6683Cb9b44810369C873679f8073bCBE52F27'
const BHS_HAKKA_BPT = '0xaE95D3198d602acFB18F9188d733d710e14A27Dd'
const BHS_HAKKA_POOL = '0x3792ee68E736b8214D4eDC91b1B3340B525e00BF'
const hakkaGuildBank = '0x83D0D842e6DB3B020f384a2af11bD14787BEC8E7'
const sHakka = '0xd9958826Bce875A75cc1789D5929459E6ff15040'
const intelligenceETH = ['0x0F2fd95c221770d108aCD5363D25b06Bdc43140B']
const intelligenceBSC = ['0xD8B3fF98025Cf203Ba6D7Bb2d25DBeEF9539E6FB', '0x517Ef6281a9b3dc4Ef6B0318Bc5EDFDCf677d29D', '0x0A3e364eE37bac9E6aFF9E864E65B4603D5BC5D4']
const BSC_BHS_ADDRESS = '0x75192D6f3d51554CC2eE7B40C3aAc5f97934ce7E'

async function ethereum(api) {
  const toa = [
    [nullAddress, thirdFloorAddress], // thirdFloor
    // guild bank
    [nullAddress, hakkaGuildBank],
    [ADDRESSES.ethereum.MKR, hakkaGuildBank],
    ['0x35101c731b1548B5e48bb23F99eDBc2f5c341935', hakkaGuildBank],
    [ADDRESSES.ethereum.USDC, hakkaGuildBank],
  ]

  return sumTokens2({ tokensAndOwners: toa, api, })
}
async function bsc(api) {
  const toa = [
    [ADDRESSES.bsc.BUSD, BSC_BHS_ADDRESS], // thirdFloor
    [ADDRESSES.bsc.USDT, BSC_BHS_ADDRESS], // thirdFloor
  ]

  return sumTokens2({ tokensAndOwners: toa, api })
}

module.exports = {
  ethereum: {
    tvl: ethereum,
    pool2: sumTokensExport({
      tokensAndOwners: [
        [BHS_USDC_DAI_HAKKA_BPT, BHS_USDC_DAI_HAKKA_POOL],
        [BHS_HAKKA_BPT, BHS_HAKKA_POOL],
      ]
    }),
    staking: sumTokensExport({ owners: [sHakka, ...intelligenceETH], tokens: [HAKKA_ADDRESSES[1]] }),
  },
  bsc: {
    tvl: bsc,
    staking: sumTokensExport({ owners: intelligenceBSC, tokens: [HAKKA_ADDRESSES[56]], }),
  }
}
