const {
  sumTokensAndLPsSharedOwners,
  sumLPWithOnlyOneTokenOtherThanKnown,
} = require("../helper/unwrapLPs");
const { stakings } = require("../helper/staking");

const spolar = "0x9D6fc90b25976E40adaD5A3EdD08af9ed7a21729";
const spolarRewardPool = "0xA5dF6D8D59A7fBDb8a11E23FDa9d11c4103dc49f";
const polarSunrise = "0xA452f676F109d34665877B7a7B203f2B445D7DE0";
const tripolarSunrise = "0x203a65b3153C55B57f911Ea73549ed0b8EC82B2D";
const ethernalSunrise = "0x813c989395f585115152f5D54FdD181fC19CA82a";
const orbitalSunrise = "0x154ad27D2C8bC616A90a5eEc3e6297f9fB7aB88e";
const tripolar = "0x60527a2751A827ec0Adf861EfcAcbf111587d748";

const polarLPTokens = [
  "0x3fa4d0145a0b6Ad0584B1ad5f61cB490A04d8242", // POLAR-NEAR
  "0xADf9D0C77c70FCb1fDB868F54211288fCE9937DF", // SPOLAR-NEAR
  "0x75890912E9bb373dD0aA57a3fe9eC748Bf923915", // POLAR-STNEAR
];

const tripolarLPTokens = [
  "0x85f155fdcf2a951fd95734eceb99f875b84a2e27", // TRIPOLAR-XTRI
];

const ethernalLPTokens = [
  "0x81D77f8e86f65b9C0F393afe0FC743D888c2d4d7", // ETHERNAL-ETHEREUM
];

const orbitalLPTokens = [
  "0x7243cB5DBae5921c78A022110645a23a38ffBA5D", // WBTC-ORBITAL
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
    ethernalLPTokens.map((token) => [token, true]),
    [spolarRewardPool],
    chainBlocks["aurora"],
    "aurora",
    transform
  );

  await sumTokensAndLPsSharedOwners(
    balances,
    orbitalLPTokens.map((token) => [token, true]),
    [spolarRewardPool],
    chainBlocks["aurora"],
    "aurora",
    transform
  );

  await sumLPWithOnlyOneTokenOtherThanKnown(
    balances,
    tripolarLPTokens[0],
    spolarRewardPool,
    tripolar,
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
    staking: stakings(
      [polarSunrise, tripolarSunrise, ethernalSunrise, orbitalSunrise],
      spolar,
      "aurora"
    ),
  },
};
