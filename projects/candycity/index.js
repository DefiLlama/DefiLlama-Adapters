const { staking, } = require("../helper/staking");
const { getUniTVL } = require('../helper/unknownTokens')

const chainTvl = getUniTVL({
  factory: '0x84343b84EEd78228CCFB65EAdEe7659F246023bf',
  useDefaultCoreAssets: true
})

const CANDY_TOKEN = '0x06C04B0AD236e7Ca3B3189b1d049FE80109C7977';

const STAKING_CONTRACTS = [
  '0xDAf7c0e2882818b46c36AdBCe95399821Eca08F8', // masterchef
  '0x8FEf43b1f3046F8f58A76c64aD01Bc8d82ff0ad1', // candy vault
  '0xA46C4a3428a5E9B5C84A4457215D98BC8DC17AbB', // candy fixed nft staking pool
  '0xCa207941946218126BD7BBe44C5d457753490b4A', // candy shared nft staking pool
  '0x7CeA583ea310b3A8a72Ed42B3364aff16d24B3A2', // candy lock
  '0xE56C1A8D4E90d82BA06F3f49efEc69f736a32070', // candy => wcro pool
  '0xc568Ce4C714c5Ec819eA8F52596a6Fd9523A2B81', // candy => warz pool,
];

const VESTING_CONTRACTS = [
  '0x427f1230A547566a51F5Ffd5698BB65c06acA2D2', // candy vesting
]

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x84343b84EEd78228CCFB65EAdEe7659F246023bf) is used to find the LP pairs. TVL is equal to the liquidity on the AMM and the candy tokens in the staking pools / vault / vesting contract / lock contract.",
  cronos: {
    tvl:  chainTvl,
    staking: staking(STAKING_CONTRACTS, CANDY_TOKEN),
    vesting: staking(VESTING_CONTRACTS, CANDY_TOKEN),
  },
}