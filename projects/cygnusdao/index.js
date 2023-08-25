const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const FACTORY_CONTRACT = "0x94faE55669327e71E9EC579067ad6C3C3b84e574";
const POLYGON_USDC_ADDRESS = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";

function cygnalytics(category) {
  // futuristic parameter
  return async (timestamp, block, _, { api }) => {
    let balances = {};

    const shuttlesDeployed = await api.call({
      abi: abi.shuttlesDeployed,
      target: FACTORY_CONTRACT,
    });

    let shuttleIds = Array.from(
      { length: shuttlesDeployed - 2 },
      (_, i) => i + 2
    );

    const shuttleTvlUsds = await sdk.api.abi.multiCall({
      abi: abi.shuttleTvlUsd,
      calls: shuttleIds.map((shuttleId, i) => ({
        target: FACTORY_CONTRACT,
        params: shuttleId,
      })),
      chain: "polygon",
    });

    const transform = (address) => `polygon:${POLYGON_USDC_ADDRESS}`;
    sdk.util.sumMultiBalanceOf(balances, shuttleTvlUsds, true, transform);

    return balances;
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "TVL of all shuttles (borrowable + collateral).",
  polygon: {
    tvl: cygnalytics(0),
  },
};
