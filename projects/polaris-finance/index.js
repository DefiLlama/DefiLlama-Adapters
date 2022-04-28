const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { stakings } = require("../helper/staking");

const spolar = "0x9D6fc90b25976E40adaD5A3EdD08af9ed7a21729";
const spolarRewardPool = "0xA5dF6D8D59A7fBDb8a11E23FDa9d11c4103dc49f";
const polarSunrise = "0xA452f676F109d34665877B7a7B203f2B445D7DE0";
const lunarSunrise = "0xf3Cd8F422ffE23434C011f43F61879373b31a913";

const polarLPTokens = [
  "0x3fa4d0145a0b6Ad0584B1ad5f61cB490A04d8242", // POLAR-NEAR
  "0xADf9D0C77c70FCb1fDB868F54211288fCE9937DF", // SPOLAR-NEAR
];

const lunarLPTokens = [
  "0x3e50da46cB79d1f9F08445984f207278796CE2d2", // LUNAR-LUNA
];

const pool2Total = async (_timestamp, _ethBlock, chainBlocks) => {
  let balances = {};
  let transform = (addr) => `${"aurora"}:${addr}`;
  await sumTokensAndLPsSharedOwners(
    balances,
    polarLPTokens.map((token) => [token, true]),
    [spolarRewardPool],
    chainBlocks["aurora"],
    "aurora",
    transform
  );
  await sumTokensAndLPsSharedOwners(
    balances,
    lunarLPTokens.map((token) => [token, true]),
    [spolarRewardPool],
    chainBlocks["aurora"],
    "aurora",
    transform
  );
  return balances;
};

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "Pool2 TVL accounts for all LPs staked in Dawn, Staking TVL accounts for all tokens staked in Sunrise.",
  aurora: {
    tvl: async () => ({}),
    pool2: pool2Total,
    staking: stakings([polarSunrise, lunarSunrise], spolar, "aurora"),
  },
};
