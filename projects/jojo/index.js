const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const cbethBase = ADDRESSES.base.cbETH;
const degenBase = "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed";
const mUsdcBase = "0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22";

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
        tokens: [ADDRESSES.base.USDC, ADDRESSES.base.WETH, cbethBase, degenBase, mUsdcBase, ],
        owners: ['0x2f7c3cf9d9280b165981311b822becc4e05fe635', '0xf8192489A8015cA1690a556D42F7328Ea1Bb53D0', '0x8B7e1924fF57EEc8EbD87254E4de6Ff397f039D3']
      }
    )
  },
}
