const { ChainApi } = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json');

const STXRP = '0x4C18Ff3C89632c3Dd62E796c0aFA5c07c4c1B2b3';

async function lockedXRPL(api) {
  const flareApi = new ChainApi({ chain: 'flare', timestamp: api.timestamp });
  await flareApi.getBlock();

  // Firelight: stXRP totalSupply (backed 1:1 by FXRP)
  const stxrpSupply = await flareApi.call({ abi: 'uint256:totalSupply', target: STXRP });

  api.add(ADDRESSES.ripple.XRP, stxrpSupply);
  return api.getBalances();
}

module.exports = {
  ripple: {
    tvl: lockedXRPL,
  },
  methodology: "Counts stXRP total supply from Firelight staking on Flare. stXRP is backed 1:1 by FXRP, which is 1:1 backed by XRP.",
};
