const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");

const rabbitStaking = "0x0586Cd1032FF9f882E29f9E8a6008d097F87D71b";
const RS = "0xc25b7244e192d531495c400c64ea914a77e730a2";

const BANK_CONTRACT = "0xc18907269640D11E2A91D7204f33C5115Ce3419e";

const bscTvl = async (api) => {

  const poolsInfo = [
    ADDRESSES.bsc.USDT,
    ADDRESSES.bsc.BUSD,
    ADDRESSES.bsc.ETH,
    ADDRESSES.bsc.BTCB,
    '0x95a1199eba84ac5f19546519e287d43d2f0e1b41',
    '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47',
    '0x9c65ab58d8d978db963e63f2bfb7121627e3a739',
    '0x7083609fce4d1d8dc0c979aab8c869ea2c873402',
    '0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63',
    '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
    '0xbf5140a22578168fd562dccf235e5d43a02ce9b1',
    '0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd',
    '0x0d8ce2a99bb6e3b7db580ed848240e4a0f9ae153',
    '0x4338665cbb7b2485a8855a139b75d5e34ab0db94',
  ]
  return api.sumTokens({ owner: BANK_CONTRACT, tokens: poolsInfo})
};

module.exports = {
  bsc: {
    staking: staking(rabbitStaking, RS),
    tvl: bscTvl,
  },
  deadFrom: "2023-20-20",
  methodology: "Counts TVL on all the Farms through Bank Contract; and the Treasury portion on the Rabbit DAO product",
};
