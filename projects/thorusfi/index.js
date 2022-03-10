const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const { transformAvaxAddress } = require("../helper/portedTokens");
const { calculateUniTvl } = require("../helper/calculateUniTvl");

const factoryContract = "0xa98ea6356A316b44Bf710D5f9b6b4eA0081409Ef";

const thorusMaster_avax = "0x871d68cFa4994170403D9C1c7b3D3E037c76437d";
const THO_avax = "0xAE4AA155D2987B454C29450ef4f862CF00907B61";

const thorusMaster_moonbeam = "0xEeB84a24e10502D8A5c97B11df381D1550B25b9d";
const THO_moonbeam = "0x735aBE48e8782948a37C7765ECb76b98CdE97B0F";

async function avaxTvl(timestamp, ethBlock, chainBlocks) {
  const transformAddres = await transformAvaxAddress();
  const balances = calculateUniTvl(
    transformAddres,
    chainBlocks.avax,
    "avax",
    factoryContract,
    0,
    true
  );
  return balances;
}

const moonbeamTvl = calculateUsdUniTvl(
  factoryContract,
  "moonbeam",
  "0xAcc15dC74880C9944775448304B263D191c6077F", // WGLMR
  [
    "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b", // USDC
    "0xfa9343c3897324496a05fc75abed6bac29f8a40f", // ETH
    "0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73", // USDT
    "0x765277eebeca2e31912c9946eae1021199b39c61", // DAI
    "0x922d641a426dcffaef11680e5358f34d97d112e1", // WBTC
    THO_moonbeam,
  ],
  "moonbeam"
);

module.exports = {
  timetravel: true,
  doublecounted: false,
  misrepresentedTokens: true,
  avalanche: {
    tvl: avaxTvl,
    staking: staking(thorusMaster_avax, THO_avax, "avax"),
    treasury: 1,
  },
  moonbeam: {
    tvl: moonbeamTvl,
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
