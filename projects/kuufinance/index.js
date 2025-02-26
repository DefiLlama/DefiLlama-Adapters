const ADDRESSES = require('../helper/coreAssets.json')

const { sumTokensExport } = require('../helper/unwrapLPs')

const JITU_CONTRACT_ADDRESS = "0x037BB12721A8876386411dAE5E31ff0c5bA991A8";

module.exports = {
  deadFrom: 1648765747,
  hallmarks: [
    [1633737600, "pausing liquidations program indefinitely"]
  ],
  avax:{
    tvl: sumTokensExport({
      owner: JITU_CONTRACT_ADDRESS,
      tokens: [
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        ADDRESSES.avax.WETH_e,
        ADDRESSES.avax.WBTC_e,
        ADDRESSES.avax.USDT_e,
        ADDRESSES.avax.DAI,
        '0x5947BB275c521040051D82396192181b413227A3'
      ]
    }),
  },
  methodology: `We count as TVL all the assets deposited in JITU contract`,
};
