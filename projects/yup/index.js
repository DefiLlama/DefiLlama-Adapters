const { pool2 } = require("../helper/pool2");
const { sumTokens2 } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk')
const POLY_LP = '0xfe8bacb45a5ce5cf0746f33d3a792c98fbd358e0'
const POLY_MASTERCHEF = '0xabc4250b8813D40c8C42290384C3C8c8BA33dBE6'
const ETH_LP = '0x916560c92f423bf7d20f34591a6b27a254c3bd7a'
const ETH_LP_BRIDGED = '0x5b51f8a6651e4d45d0e3d0131e73b30b7e3443f4'
const POLY_ETH_MASTERCHEF = '0xa378721517B5030D9D17CaF68623bB1f2CcF5c2e'

module.exports = {
  timetravel: false,
  polygon: {
    tvl: async () => ({}),
    pool2: pool2(POLY_MASTERCHEF, POLY_LP),
  },
  ethereum: {
    tvl: async () => ({}),
    pool2: async (api) => {
      const { output: LPbalance } = await sdk.api.erc20.balanceOf({ target: ETH_LP_BRIDGED, owner: POLY_ETH_MASTERCHEF, chain: 'polygon' })
      api.add(ETH_LP, LPbalance)
      return sumTokens2({ api, resolveLP: true })
    }
  },
};
