const { stakingUnknownPricedLP } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')


const FACTORY_CONTRACT = "0x937e0c67d21Df99eaEa0e6a1055A5b783291DC8f";
const FATE_TOKEN = "0x4853365bC81f8270D902076892e13F27c27e7266";
const FATE_USDC_PAIR_TOKEN = "0x69c894Dce6FA2E3b89D3111d29167F0484AC0b2A";
const X_FATE_TOKEN = "0x56BE76031A4614370fA1f188e01e18a1CF16E642";

module.exports = {
  polygon: {
    tvl: getUniTVL({
      factory: FACTORY_CONTRACT,
      chain: 'polygon',
      coreAssets: [
        '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // WMATIC
        '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC
        '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT
        '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', // DAI
      ],
    }),
    staking: stakingUnknownPricedLP(X_FATE_TOKEN, FATE_TOKEN, 'polygon', FATE_USDC_PAIR_TOKEN)
  },
}
