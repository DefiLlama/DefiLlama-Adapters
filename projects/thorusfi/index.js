const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");
const { getUniTVL } = require('../helper/unknownTokens')

const factoryContract = "0xa98ea6356A316b44Bf710D5f9b6b4eA0081409Ef";

const thorusMaster_avax = "0x871d68cFa4994170403D9C1c7b3D3E037c76437d";
const THO_avax = "0xAE4AA155D2987B454C29450ef4f862CF00907B61";

const thorusMaster_moonbeam = "0xEeB84a24e10502D8A5c97B11df381D1550B25b9d";
const THO_moonbeam = ADDRESSES.shiden.JPYC;


module.exports = {
    avax:{
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: factoryContract,
    }),
    staking: staking(thorusMaster_avax, THO_avax),
  },
  moonbeam: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true, 
      factory: factoryContract,
    }),
    staking: staking(
      thorusMaster_moonbeam,
      THO_moonbeam,
      "moonbeam",
      `avax:${THO_avax}`
    ),
  },
  methodology:
    "We count liquidity on all AMM pools, using the TVL chart on https://app.thorus.fi/dashboard as the source. The staking portion of TVL includes the THO within the ThorusMaster contracts.",
};
