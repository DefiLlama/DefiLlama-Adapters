const sdk = require("@defillama/sdk");
const { compoundExports2 } = require('../helper/compound');


const sonicComptrollers = [
  { name: 'Core Sonic Pool', comptroller: '0xccAdFCFaa71407707fb3dC93D7d83950171aA2c9' },
  { name: 'Liquid Staked S Pool', comptroller: '0x1db5134ee31278809b2d85fab2796141dbe0d041' },
  { name: 'Spectra PT scETH Pool', comptroller: '0x62c627e08f996d7d7563e135e527f422fee34786' },
  { name: 'Spectra PT scUSD Pool', comptroller: '0x26190C71c27e089533186338d16abB2ba9528969' },
  { name: 'Sonic Ecosystem Pool', comptroller: '0x0c9425eCFbd64a96D306f36e8281EE5308446d31' },
];


const plasmaComptrollers = [
  { name: 'Core Plasma Pool', comptroller: '0xA3F48548562A30A33257A752d396A20B4413E8E3' },
];

async function getPoolsData(comptrollers, chain) {
  return Promise.all(
    comptrollers.map(cfg => compoundExports2({ comptroller: cfg.comptroller, chain }))
  );
}

async function tvl(chainComptrollers, chain, ...args) {
  const poolsData = await getPoolsData(chainComptrollers, chain);
  return sdk.util.sumChainTvls(poolsData.map(p => p.tvl))(...args);
}

async function borrowed(chainComptrollers, chain, ...args) {
  const poolsData = await getPoolsData(chainComptrollers, chain);
  return sdk.util.sumChainTvls(poolsData.map(p => p.borrowed))(...args);
}

module.exports = {
  sonic: {
    tvl: (...args) => tvl(sonicComptrollers, 'sonic', ...args),
    borrowed: (...args) => borrowed(sonicComptrollers, 'sonic', ...args),
  },
  plasma: {
    tvl: (...args) => tvl(plasmaComptrollers, 'plasma', ...args),
    borrowed: (...args) => borrowed(plasmaComptrollers, 'plasma', ...args),
  },
}
