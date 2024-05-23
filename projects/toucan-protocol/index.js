const sdk = require('@defillama/sdk')
const { CONFIG_DATA } = require("./config");

const getCalculationMethod = (chain) => {
  return async (api,) => {
    const supplyCalls = []
    Object.keys(CONFIG_DATA[chain]).map((key) => {
      supplyCalls.push(CONFIG_DATA[chain][key]);
    })

    let [bct, nct, char] = await api.multiCall({ abi: 'erc20:totalSupply', calls: supplyCalls, })

    // If the current block is later than the date BCT was transferred to KlimaDAO, return 0
    if (api.timestamp > 1709828986)
      bct = 0

    return {
      'toucan-protocol-base-carbon-tonne': (bct ?? 0) / 1e18,
      'toucan-protocol-nature-carbon-tonne': (nct ?? 0) / 1e18,
      'biochar': (char ?? 0) / 1e18,
    };
  };
};

const getRegenCredits = () => {
  return async () => {
    const transferred = (await sdk.api.abi.call({
      abi: 'uint256:totalTransferred',
      target: CONFIG_DATA['regen'].nct_bridge,
      chain: 'polygon',
    })).output;

    return {
      'toucan-protocol-nature-carbon-tonne': transferred / 1e18,
    };
  };
};

module.exports = {
  start: 1634842800,
  base: {
    tvl: getCalculationMethod("base")
  },
  celo: {
    tvl: getCalculationMethod("celo")
  },
  polygon: {
    tvl: getCalculationMethod("polygon")
  },
  regen: {
    tvl: getRegenCredits()
  },
  hallmarks: [
    [1653429600, "Verra prohibits tokenization"], [1709828986, "BCT administrative control transferred to KlimaDAO"],
  ]
};
