const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const configs = {
  ETH_LOCKER: "0x957d6ff09368fcb01ca886f8e937368c6a4c760e",
  wstETH_LOCKER: "0x90075915714235a3816cf6ee4fe703c2e36a566a",
  weETH_LOCKER: "0x76e38de3d19b90afffc4253d1556b83c063e2ae8",
  ezETH_LOCKER: "0x05cca71e1f44e721fc16bbbcda6c62091d240deb",
  weETH: "0x35751007a407ca6feffe80b3cb397736d2cf4dbe",
};

module.exports = {
  methodology: "Total staking",
  start: 210487219,
  arbitrum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.arbitrum.WETH, configs.ETH_LOCKER],
        [ADDRESSES.blast.ezETH, configs.ezETH_LOCKER],
        [ADDRESSES.arbitrum.WSTETH, configs.wstETH_LOCKER],
        [configs.weETH, configs.weETH_LOCKER],
      ],
    }),
  },
};
