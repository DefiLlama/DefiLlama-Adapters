const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  era: { tvl: sumTokensExport({ tokens: [ADDRESSES.era.USDC], owners: ['0x47eAD228547db8397398C1D3aAfd0847CBEbddeC'], }) },
  bsc: { tvl: sumTokensExport({ tokens: [ADDRESSES.bsc.USDC], owners: ['0x25173BB47CB712cFCDFc13ECBebDAd753090801E'], }) },
  arbitrum: {
    tvl: sumTokensExport(
      {
        tokens: [ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.WETH, ADDRESSES.arbitrum.WBTC,
        ADDRESSES.arbitrum.ARB, ADDRESSES.arbitrum.GMX, ADDRESSES.arbitrum.WSTETH],
        owners: ['0xcd85998b31C85040C8BA59288eaA8f9beE115B01', '0xa88603625ad55e25674F46f3c831010D53d35E79', '0x0174f6d813Df42C986ADF75ec473a0162faAfcda']
      }
    )
  },
  base: {
    tvl: sumTokensExport(
      {
        tokens: [ADDRESSES.base.USDC, ADDRESSES.base.WETH],
        owners: ['0x2f7c3cf9d9280b165981311b822becc4e05fe635', '0xf8192489A8015cA1690a556D42F7328Ea1Bb53D0']
      }
    )
  },
}
