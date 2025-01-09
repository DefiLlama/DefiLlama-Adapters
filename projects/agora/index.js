const sdk = require("@defillama/sdk");
const { compoundExports, methodology, } = require("../helper/compound");
const { getUniTVL } = require('../helper/unknownTokens')

const factory = '0x3c4063B964B1b3bF229315fCc4df61a694B0aE84'

const { tvl: agoraTvl, } = compoundExports("0x3fe29D7412aCDade27e21f55a65a7ddcCE23d9B3", "0xcFd482DcE13cA1d27834D381AF1b570E9E6C6810",);
const { tvl: agoraPlusTvl, } = compoundExports("0x92DcecEaF4c0fDA373899FEea00032E8E8Da58Da", "0xE85A1ae1A2A21135c49ADEd398D3FD5Ed032B28e",);
const { tvl: agoraStakeTvl, } = compoundExports("0xb36DF0773AbD23081516F54f9dbB9a99Ec27dbB0", "0xc3034143816398d37Ec9447c9CA17c407e96Dc12",);
const { tvl: agoraFarmTvl, } = compoundExports("0xEC1A06f320E6e295Ab6892BB4e0f9e29c712F11F", "0x13Cb104a1D94A89a260b27DfAAB07C862da622E5",);

const chainTvl = getUniTVL({ factory, useDefaultCoreAssets: true, })

module.exports = {
  hallmarks: [
    [1649376000, "STARS collateral Exploit"]
  ],
  methodology,
  misrepresentedTokens: true,
  metis: {
    tvl: sdk.util.sumChainTvls([chainTvl, agoraTvl, agoraPlusTvl, agoraFarmTvl, agoraStakeTvl]),
    borrowed: () => ({}),
  },
};
