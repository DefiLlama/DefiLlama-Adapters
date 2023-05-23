const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { compoundExports } = require("../helper/compound");
const { getUniTVL } = require('../helper/unknownTokens')

const factory = '0x3c4063B964B1b3bF229315fCc4df61a694B0aE84'
const metis = ADDRESSES.metis.Metis
const agora = '0x0Ed0Ca6872073E02cd3aE005BaF04bA43BE947fA'

const whitelist = [
  agora, // AGORA
  ADDRESSES.metis.m_USDC, // USDC
  ADDRESSES.metis.m_USDT, // USDT
  ADDRESSES.metis.WETH, // WETH
  '0x94e56c0c59433599ba857a9a7243b2826745cf91', //kWBTC
  '0x6d11f074131e3fc61c983cce538f5d0ca3553c0f', //kUSDC
  '0xcfd482dce13ca1d27834d381af1b570e9e6c6810', //kmetis
  '0x2e9347dda00b3ec1b188963b590ca1ecbd73145a', //kweth
]

const { tvl: agoraTvl, borrowed: agoraBorrowed } = compoundExports(
  "0x3fe29D7412aCDade27e21f55a65a7ddcCE23d9B3",
  "metis",
  "0xcFd482DcE13cA1d27834D381AF1b570E9E6C6810",
  metis,
);

const { tvl: agoraPlusTvl, borrowed: agoraPlusBorrowed } = compoundExports(
  "0x92DcecEaF4c0fDA373899FEea00032E8E8Da58Da",
  "metis",
  "0xE85A1ae1A2A21135c49ADEd398D3FD5Ed032B28e",
  metis,
  undefined,
  symbol => symbol.indexOf('appuffNetswap') > -1
);

const { tvl: agoraStakeTvl, borrowed: agoraStakeBorrowed } = compoundExports(
  "0xb36DF0773AbD23081516F54f9dbB9a99Ec27dbB0",
  "metis",
  "0xc3034143816398d37Ec9447c9CA17c407e96Dc12",
  metis,
  undefined,
);

const { tvl: agoraFarmTvl, borrowed: agoraFarmBorrowed } = compoundExports(
  "0xEC1A06f320E6e295Ab6892BB4e0f9e29c712F11F",
  "metis",
  "0x13Cb104a1D94A89a260b27DfAAB07C862da622E5",
  metis,
  undefined,
);

const chainTvl = getUniTVL({ factory, chain: 'metis', useDefaultCoreAssets: true, })

module.exports = {
  hallmarks: [
    [1649376000, "STARS collateral Exploit"]
  ],
  incentivized: true,
  misrepresentedTokens: true,
  methodology: `As in Compound Finance, TVL counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are counted as "Borrowed" TVL and can be toggled towards the regular TVL.`,
  metis: {
    tvl: sdk.util.sumChainTvls([chainTvl, agoraTvl, agoraPlusTvl, agoraFarmTvl, agoraStakeTvl]),
    borrowed: sdk.util.sumChainTvls([agoraBorrowed, agoraPlusBorrowed, agoraFarmBorrowed, agoraStakeBorrowed]),
  },
};
