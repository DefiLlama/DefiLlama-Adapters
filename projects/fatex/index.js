const { stakingPriceLP } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')


const FACTORY_CONTRACT = "0x937e0c67d21Df99eaEa0e6a1055A5b783291DC8f";
const FATE_TOKEN = "0x4853365bC81f8270D902076892e13F27c27e7266";
const FATE_USDC_PAIR_TOKEN = "0x69c894Dce6FA2E3b89D3111d29167F0484AC0b2A";
const X_FATE_TOKEN = "0x56BE76031A4614370fA1f188e01e18a1CF16E642";

module.exports = {
  polygon: {
    tvl: getUniTVL({
      factory: FACTORY_CONTRACT,
      useDefaultCoreAssets: true,
    }),
    staking: stakingPriceLP(X_FATE_TOKEN, FATE_TOKEN, FATE_USDC_PAIR_TOKEN)
  },
}
