const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const { CONFIG_DATA } = require("./config");

const decimals = 1e18;

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

    const bct = BigNumber(supplies[0].output);
    const nct = BigNumber(supplies[1].output);

    return {
      'toucan-protocol-base-carbon-tonne': bct.div(decimals).toFixed(0),
      'toucan-protocol-nature-carbon-tonne': nct.div(decimals).toFixed(0),
    };
  };
};

const getRegenCredits = () => {
  return async (timestamp, block, chainBlocks) => {
    const transferred = (await sdk.api.abi.call({
      abi: 'uint256:totalTransferred',
      target: CONFIG_DATA['regen'].nct_bridge,
      chain: 'polygon',
      block: chainBlocks['polygon'],
    })).output;

    const nct = BigNumber(transferred);

    return {
      'toucan-protocol-nature-carbon-tonne': nct.div(decimals).toFixed(0),
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
  regen: {
    tvl: getRegenCredits()
  },
  hallmarks: [
    [1653429600, "Verra prohibits tokenization"],
  ]
};
