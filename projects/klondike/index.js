const abi = {
    "allAllowedTokens": "address[]:allAllowedTokens"
  };
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { sumTokens2 } = require("../helper/unwrapLPs");

const stakingContract = "0xAcbdB82f07B2653137d3A08A22637121422ae747";
const KlonX = "0xbf15797BB5E47F6fB094A4abDB2cfC43F77179Ef";

const KlonXWBTCLPKlonXPool = "0x185bDc02aAFbEcDc8DC574e8319228B586764415";
const WBTC_KlonX_UNI = "0x69cda6eda9986f7fca8a5dba06c819b535f4fc50";

const KWBTCWBTCLPKlonXPool = "0x451D00AF6E751537a9A2cFF40CdFB1119cd1fA7d";
const WBTC_KBTC_UNI = "0x1F3D61248EC81542889535595903078109707941";

const KXUSDDAILPKlonXPool = "0xE301F632E573A3F8bd06fe623E4440560ab08692";
const KXUSD_DAI_UNI = "0x672C973155c46Fc264c077a41218Ddc397bB7532";

const fundContracts = [
  //stablFundContract
  "0x58285B88951DE1C9a5255DDfdE28A68b30EE7559",
  //devFundContract
  "0x3BE908C22D21ab32C5A04CFCa3a9A70d4FEfc098",
];

async function ethTvl(api) {
  const tokenAddresses = await api.call({ abi: abi.allAllowedTokens, target: fundContracts[0], })
  tokenAddresses.push(WBTC_KBTC_UNI, KXUSD_DAI_UNI)
  fundContracts.push(KWBTCWBTCLPKlonXPool, KXUSDDAILPKlonXPool)

  return sumTokens2({ api, tokens: tokenAddresses, owners: fundContracts, resolveLP: true })
}

module.exports = {
  ethereum: {
    staking: staking(stakingContract, KlonX),
    pool2: pool2(KlonXWBTCLPKlonXPool, WBTC_KlonX_UNI),
    tvl: ethTvl,
  },
  methodology: "Counts liquidity on the Farms through their Contracts",
};
