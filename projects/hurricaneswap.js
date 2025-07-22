const ADDRESSES = require('./helper/coreAssets.json')
const sdk = require("@defillama/sdk");

const { staking, stakings } = require("./helper/staking");
const { getUniTVL } = require('./helper/unknownTokens')

const masterChefV1 = "0x9984d70D5Ab32E8e552974A5A24661BFEfE81DbE";
const masterChefV2 = "0x1c9F36FE608190D1fe99e001b596c31871696b24";
const AVAX = ADDRESSES.avax.WAVAX;

const stakingConttract_xhctBar = "0x75B797a0ed87F77bB546F3A3556F18fC35a01140";
const stakingConttract_shctBar = "0xE4aE2E8648B8E84c4A487a559b04e884B822a350";
const HCT = "0x45C13620B55C35A5f539d26E88247011Eb10fDbd";

const chainTvl = getUniTVL({
  factory: '0x7009b3619d5ee60d0665BA27Cf85eDF95fd8Ad01',
  useDefaultCoreAssets: true,
})

module.exports = {
      misrepresentedTokens: true,
  avax: {
    tvl: sdk.util.sumChainTvls([chainTvl, staking(masterChefV2, AVAX)]),
    staking: stakings(
      [
        stakingConttract_xhctBar,
        stakingConttract_shctBar,
        masterChefV2,
        masterChefV1,
      ],
      HCT,
      "avax"
    ),
  },
  methodology:
    'We count TVL from the "0x7009b3619d5ee60d0665BA27Cf85eDF95fd8Ad01" factory address, which includes all pairs data of HurricaneSwap. The staking portion includes the liquidity in the HCTBar (xHCT), StakingReward (sHCT) contract and the WAVAX deposited in pool contract.',
};
