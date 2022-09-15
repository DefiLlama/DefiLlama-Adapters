const sdk = require('@defillama/sdk');
const { getChainTransform} = require("../helper/portedTokens")
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const madDAI = "0x63743ACF2c7cfee65A5E356A4C4A005b586fC7AA"
const madUSDC = "0x51e44FfaD5C2B122C8b635671FCC8139dc636E82"
const madUSDT = "0x7FF4a56B32ee13D7D4D405887E0eA37d61Ed919e"
const madWETH = "0x5842C5532b61aCF3227679a8b1BD0242a41752f2"
const madWBTC = "0xF80699Dc594e00aE7bA200c7533a07C1604A106D"

//////////////////////////// UNI AMM ////////////////////////////////////
const evmoswapTvl = calculateUsdUniTvl(
  "0xF24E36e53628C3086493B9EfA785ab9DD85232EB",
  "evmos",
  "0xD4949664cD82660AaE99bEdc034a0deA8A0bd517",
  [ madDAI, madUSDC, madUSDT, madWETH, madWBTC ],
  "evmos"
);

//////////////////////////// STABLE AMM ////////////////////////////////////
const poolAddressesEvmos = [
  "0xf0a5b0fa1531C94754241911A2E6D94506336321", // 3pool
];

async function stableAMMTvl(timestamp, chainBlocks) {
  const balances = {};
  const transformAddress = await getChainTransform("evmos");
  await sumTokensAndLPsSharedOwners(
      balances,
      [
        [madDAI, false],
        [madUSDC, false],
        [madUSDT, false],
      ],
      poolAddressesEvmos,
      chainBlocks["evmos"],
      "evmos",
      transformAddress
  );
  return balances;
}


module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xF24E36e53628C3086493B9EfA785ab9DD85232EB) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  evmos: {
    tvl: sdk.util.sumChainTvls([evmoswapTvl, stableAMMTvl]),
  },
}; // node test.js projects/evmoswap/index.js
