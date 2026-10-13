// SoneVibe: VibeSwap (Uniswap V2-style DEX) + SoneVibe Lending (Compound V2-style)
// Addresses: https://github.com/SoneVibe/Lending/blob/main/docs/networks.json
const { getUniTVL } = require('../helper/cache/uniswap')
const { compoundExports2 } = require('../helper/compound')
const { mergeExports } = require('../helper/utils')

const dex = {
  soneium: '0x06C0b58287794a0bdce20ce768b601CA974618DC',
  astar: '0x1b404A1e41cCe5f98DC9CBF0c1372F8b68e2588c',
  bsc: '0xaf905e66038EcE89e03D843B35a11D262053B630',
}

const lending = {
  // V_Master has no getAllMarkets(), so markets are pinned (from networks.json)
  soneium: { comptroller: '0x1126859aB6911Fc3b4f86f2F65E7B6F2eEDe5185', markets: ['0x7CA06966B0c07C5e35aA180643E98bB3057EBb27', '0xDB3e66b87c42C7F3599fbdcBFe08DfF0689A6D77', '0x96ae93Df119c131469b38e3d558899F23678dCFb'] },
  astar: { comptroller: '0x4B07FedD55C65373Dec9d983EA279D7d65259ec7', markets: ['0x40f4bFA1e152Ac5a9b066C0BEc5BD83227F8520A', '0xA7f41D0f41ec8aeb5d57c0E5850F0dB28Ca68E54', '0xe5cE001dD3439A198b2A19567D5F3CD6cd30e61f'] },
}

const dexExports = {}
Object.entries(dex).forEach(([chain, factory]) => {
  dexExports[chain] = { tvl: getUniTVL({ factory, useDefaultCoreAssets: true }) }
})

const lendingExports = {}
Object.entries(lending).forEach(([chain, config]) => {
  lendingExports[chain] = compoundExports2(config)
})

module.exports = mergeExports([dexExports, lendingExports])
module.exports.methodology = 'DEX TVL: reserves of all VibeSwap pairs created by the factory (core assets only). Lending TVL: underlying tokens held by SoneVibe cTokens listed by the comptroller; borrowed = total borrows.'
