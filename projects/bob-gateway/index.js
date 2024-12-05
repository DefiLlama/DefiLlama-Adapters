const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const factories = {
  v1: "0x1831d29376eb94bba3ca855af7984db923768b27",
  v2: "0x37f330e667208633e1da1cf601d01f0ef8484306",
  v3: "0xAE6770a207E86FaE3b191564FA55ce7Bfee0Dde9",
};

const abis = {
  v1: {
    allOnramps: "function allOnramps() view returns (address[])",
  },
  v2: {
    allGateways: "function allGateways() view returns (address[])",
  },
  v3: {
    allGateways: "function allGateways() view returns (address[])",
  },
};

module.exports = {
  bob: {
    tvl: async (api) => {
      const gateways = (await api.batchCall([
        { abi: abis.v1.allOnramps, target: factories.v1 },
        { abi: abis.v2.allGateways, target: factories.v2 },
        { abi: abis.v3.allGateways, target: factories.v3 }
      ])).flat();

      return sumTokens2({
        api,
        tokens: [
          ADDRESSES.bob.WBTC,
          ADDRESSES.bob.TBTC,
          ADDRESSES.bob.SolvBTC,
          ADDRESSES.bob.SolvBTC_BBN,
          ADDRESSES.bob.FBTC,
          ADDRESSES.bob.uniBTC,
          ADDRESSES.bob.pumpBTC,
        ],
        owners: gateways,
      });
    },
  }
};

