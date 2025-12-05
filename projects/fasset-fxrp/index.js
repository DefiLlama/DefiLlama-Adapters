const { ChainApi } = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json');
const { FXRP, KINETIC_ISO_FXRP, SPARKDEX_V3_POOLS, SPARKDEX_V2_FXRP_WFLR, STXRP } = require('./addresses');

async function tvl(api) {
  // Create Flare API to call contracts on Flare chain
  const flareApi = new ChainApi({ chain: 'flare', timestamp: api.timestamp });
  await flareApi.getBlock();

  // Kinetic: getCash() + totalBorrows() = total FXRP supplied
  const [kineticCash, kineticBorrows] = await Promise.all([
    flareApi.call({ abi: 'uint256:getCash', target: KINETIC_ISO_FXRP }),
    flareApi.call({ abi: 'uint256:totalBorrows', target: KINETIC_ISO_FXRP }),
  ]);

  // SparkDEX V3-1: FXRP balance in each pool
  const v3Balances = await flareApi.multiCall({
    abi: 'erc20:balanceOf',
    calls: SPARKDEX_V3_POOLS.map(pool => ({ target: FXRP, params: [pool] })),
  });

  // SparkDEX V2: FXRP balance in pool
  const v2Balance = await flareApi.call({
    abi: 'erc20:balanceOf',
    target: FXRP,
    params: [SPARKDEX_V2_FXRP_WFLR],
  });

  // Firelight: stXRP totalSupply (backed 1:1 by FXRP)
  const stxrpSupply = await flareApi.call({ abi: 'uint256:totalSupply', target: STXRP });

  // Sum all FXRP and add as XRP to ripple chain
  const totalFxrp = BigInt(kineticCash) + BigInt(kineticBorrows) +
    v3Balances.reduce((sum, b) => sum + BigInt(b), 0n) +
    BigInt(v2Balance) + BigInt(stxrpSupply);

  api.add(ADDRESSES.ripple.XRP, totalFxrp.toString());
  return api.getBalances();
}

module.exports = {
  ripple: {
    tvl,
  },
  methodology: "Counts total FXRP across Flare DeFi: Kinetic (lending), SparkDEX V2/V3 (liquidity pools), and Firelight (staking). FXRP is 1:1 backed by XRP.",
};
