const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const cbethBase = "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22";
const degenBase = "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed";
const mUsdcBase = "0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22";

module.exports = {
  base: {
    tvl: sumTokensExport(
      {
        ownerTokens: [
          [[ADDRESSES.base.USDC], '0x2f7c3cf9d9280b165981311b822becc4e05fe635'],
          [[ADDRESSES.base.WETH, cbethBase, degenBase, mUsdcBase], '0xf8192489A8015cA1690a556D42F7328Ea1Bb53D0']
        ]
      }
    )
  },
}
