const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { compoundExports, methodology, } = require("../helper/compound");
const { getUniTVL } = require('../helper/unknownTokens')

const factory = '0x3c4063B964B1b3bF229315fCc4df61a694B0aE84'
const metis = ADDRESSES.metis.Metis
const agora = '0x0Ed0Ca6872073E02cd3aE005BaF04bA43BE947fA'

const { tvl: agoraTvl, } = compoundExports(
  "0x3fe29D7412aCDade27e21f55a65a7ddcCE23d9B3",
  "metis",
  "0xcFd482DcE13cA1d27834D381AF1b570E9E6C6810",
  metis,
);

const { tvl: agoraPlusTvl, } = compoundExports(
  "0x92DcecEaF4c0fDA373899FEea00032E8E8Da58Da",
  "metis",
  "0xE85A1ae1A2A21135c49ADEd398D3FD5Ed032B28e",
  metis,
  undefined,
  symbol => symbol.indexOf('appuffNetswap') > -1
);

const { tvl: agoraStakeTvl,  } = compoundExports(
  "0xb36DF0773AbD23081516F54f9dbB9a99Ec27dbB0",
  "metis",
  "0xc3034143816398d37Ec9447c9CA17c407e96Dc12",
  metis,
  undefined,
);

const { tvl: agoraFarmTvl, } = compoundExports(
  "0xEC1A06f320E6e295Ab6892BB4e0f9e29c712F11F",
  "metis",
  "0x13Cb104a1D94A89a260b27DfAAB07C862da622E5",
  metis,
  undefined,
);

const chainTvl = getUniTVL({ factory, useDefaultCoreAssets: true, })

module.exports = {
  hallmarks: [
    [1649376000, "STARS collateral Exploit"]
  ],
  methodology,
  misrepresentedTokens: true,
  metis: {
    tvl: sdk.util.sumChainTvls([chainTvl, agoraTvl, agoraPlusTvl, agoraFarmTvl, agoraStakeTvl]),
    borrowed: ()=>({}),
  },
};
