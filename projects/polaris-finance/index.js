const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { stakings } = require("../helper/staking");

const spolar = "0x9D6fc90b25976E40adaD5A3EdD08af9ed7a21729";
const spolarRewardPool = "0xA5dF6D8D59A7fBDb8a11E23FDa9d11c4103dc49f";

const sunrises = [
  ("0xA452f676F109d34665877B7a7B203f2B445D7DE0"), //polarSunrise
  ("0x203a65b3153C55B57f911Ea73549ed0b8EC82B2D"), // tripolarSunrise
  ("0x813c989395f585115152f5D54FdD181fC19CA82a"), // ethernalSunrise
  ("0x154ad27D2C8bC616A90a5eEc3e6297f9fB7aB88e"), // orbitalSunrise
  ("0x37223e0066969027954a5499ea4445bB9F55b36F"), // uspSunrise
];

const LPTokens = [
  ([ // polarLPTokens
    "0x3fa4d0145a0b6Ad0584B1ad5f61cB490A04d8242", // POLAR-NEAR
    "0xADf9D0C77c70FCb1fDB868F54211288fCE9937DF", // SPOLAR-NEAR
    "0x75890912E9bb373dD0aA57a3fe9eC748Bf923915", // POLAR-STNEAR
  ]),
  ([ // ethernalLPTokens
    "0x81D77f8e86f65b9C0F393afe0FC743D888c2d4d7", // ETHERNAL-ETHEREUM
  ]),
  ([ // orbitalLPTokens
    "0x7243cB5DBae5921c78A022110645a23a38ffBA5D", // ORBITAL-WBTC
  ]),
  ([ // tripolarLPTokens
    "0x51488c4BcEEa96Ee530bC6093Bd0c00F9461fbb5", // TRIPOLAR-TRI
  ]),
  ([ // uspLPTokens
    "0xa984B8062316AFE25c86576b0478E76E65FdF564", // USP-USDC
  ]),
];

const pool2Total = async (_timestamp, _ethBlock, chainBlocks) => {
  let balances = {};
  let transform = (addr) => `${"aurora"}:${addr}`;

  for (const lp of LPTokens) {
    await sumTokensAndLPsSharedOwners(
      balances,
      lp.map((token) => [token, true]),
      [spolarRewardPool],
      chainBlocks["aurora"],
      "aurora",
      transform
    );
  }

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
    staking: stakings(sunrises, spolar, "aurora"),
  },
};
