const { ChainApi } = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json');

const FXRP = '0xAd552A648C74D49E10027AB8a618A3ad4901c5bE';

// SparkDEX V2 Pool
const SPARKDEX_V2_FXRP_WFLR = '0xa76a120567ed3ab3065759d3ad3ab2acd79530bf';

async function lockedXRPL(api) {
  const flareApi = new ChainApi({ chain: 'flare', timestamp: api.timestamp });
  await flareApi.getBlock();

  // SparkDEX V2: FXRP balance in pool
  const v2Balance = await flareApi.call({
    abi: 'erc20:balanceOf',
    target: FXRP,
    params: [SPARKDEX_V2_FXRP_WFLR],
  });

  api.add(ADDRESSES.ripple.XRP, v2Balance);
  return api.getBalances();
}

module.exports = {
  ripple: {
    tvl: lockedXRPL,
  },
  methodology: "Counts FXRP in SparkDEX V2 liquidity pool on Flare. FXRP is 1:1 backed by XRP.",
};
