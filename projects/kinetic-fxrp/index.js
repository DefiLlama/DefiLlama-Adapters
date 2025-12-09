const { ChainApi } = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json');

const FXRP = '0xAd552A648C74D49E10027AB8a618A3ad4901c5bE';
const KINETIC_ISO_FXRP = '0x870f7B89F0d408D7CA2E6586Df26D00Ea03aA358';

async function lockedXRPL(api) {
  const flareApi = new ChainApi({ chain: 'flare', timestamp: api.timestamp });
  await flareApi.getBlock();

  // Kinetic: getCash() + totalBorrows() = total FXRP supplied
  const [kineticCash, kineticBorrows] = await Promise.all([
    flareApi.call({ abi: 'uint256:getCash', target: KINETIC_ISO_FXRP }),
    flareApi.call({ abi: 'uint256:totalBorrows', target: KINETIC_ISO_FXRP }),
  ]);

  const totalFxrp = BigInt(kineticCash) + BigInt(kineticBorrows);
  api.add(ADDRESSES.ripple.XRP, totalFxrp.toString());
  return api.getBalances();
}

module.exports = {
  ripple: {
    tvl: lockedXRPL,
  },
  methodology: "Counts total FXRP supplied to Kinetic lending protocol on Flare. FXRP is 1:1 backed by XRP.",
};
