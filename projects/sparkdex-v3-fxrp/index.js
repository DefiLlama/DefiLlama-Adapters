const { ChainApi } = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json');

const FXRP = '0xAd552A648C74D49E10027AB8a618A3ad4901c5bE';

// SparkDEX V3-1 Pools (FXRP pairs)
const SPARKDEX_V3_POOLS = [
  '0xECe100A0b337bdfa0297654f2ce49bb3936d2364', // FXRP/WFLR 0.01%
  '0x589689984a06E4640593eDec64e415c415940C7F', // FXRP/WFLR 0.05%
  '0xDAD1976C48cf93A7D90f106382C60Cd2c888b2dc', // FXRP/WFLR 0.3%
  '0x08E6cB0c6b91dba21B9b5DFF5694faB75fA91440', // FXRP/WFLR 1%
  '0xE419b154cf5a27e93966Fce28E253cADcDBE5CCF', // FXRP/USDT0 0.01%
  '0x88D46717b16619B37fa2DfD2F038DEFB4459F1F7', // FXRP/USDT0 0.05%
  '0x8F7E2dCbbb1A1BCacE7832e4770ec31D8C6937cB', // FXRP/USDT0 0.3%
  '0x38dE858370813ae58af11245962a9b03B661a9Ae', // FXRP/USDT0 1%
];

async function lockedXRPL(api) {
  const flareApi = new ChainApi({ chain: 'flare', timestamp: api.timestamp });
  await flareApi.getBlock();

  // SparkDEX V3: FXRP balance in each pool
  const v3Balances = await flareApi.multiCall({
    abi: 'erc20:balanceOf',
    calls: SPARKDEX_V3_POOLS.map(pool => ({ target: FXRP, params: [pool] })),
  });

  const totalFxrp = v3Balances.reduce((sum, b) => sum + BigInt(b), 0n);
  api.add(ADDRESSES.ripple.XRP, totalFxrp.toString());
  return api.getBalances();
}

module.exports = {
  ripple: {
    tvl: lockedXRPL,
  },
  methodology: "Counts FXRP in SparkDEX V3 liquidity pools on Flare. FXRP is 1:1 backed by XRP.",
};
