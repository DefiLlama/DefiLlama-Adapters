const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const { CONFIG_DATA } = require("./config");

const getCalculationMethod = (chain) => {
  return async (timestamp, block, chainBlocks) => {
    const supplyCalls = [
      { target: CONFIG_DATA[chain].bct },
      { target: CONFIG_DATA[chain].nct }
    ];

    const supplies = (
      await sdk.api.abi.multiCall({
        abi: 'erc20:totalSupply',
        calls: supplyCalls,
        chain,
        block: chainBlocks[chain],
      })
    ).output;

    return {
      'toucan-protocol-base-carbon-tonne': BigNumber(supplies[0].output / 1e18).toFixed(0),
      'toucan-protocol-nature-carbon-tonne': BigNumber(supplies[1].output / 1e18).toFixed(0),
    };
  };
};

module.exports = {
  start: 1634842800,
  timetravel: true,
  celo: {
    tvl: getCalculationMethod("celo")
  },
  polygon: {
    tvl: getCalculationMethod("polygon")
  },
  hallmarks: [
    [1653429600, "Verra prohibits tokenization"],
  ]
};
