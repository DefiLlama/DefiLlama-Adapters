const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require("@defillama/sdk");

const spolar = "0x9D6fc90b25976E40adaD5A3EdD08af9ed7a21729";
const spolarRewardPool = "0xA5dF6D8D59A7fBDb8a11E23FDa9d11c4103dc49f";
const chain = 'aurora'

const sunrises = [
  "0xA452f676F109d34665877B7a7B203f2B445D7DE0", //polarSunrise
  "0x203a65b3153C55B57f911Ea73549ed0b8EC82B2D", // tripolarSunrise
  "0x813c989395f585115152f5D54FdD181fC19CA82a", // oldEthernalSunrise
  "0x154ad27D2C8bC616A90a5eEc3e6297f9fB7aB88e", // oldOrbitalSunrise
  "0x37223e0066969027954a5499ea4445bB9F55b36F", // uspSunrise
  "0x33Fd42C929769f2C57cD68353Bff0bD7C6c51604", // ethernalSunrise
  "0x494E811678f84816878A6e7e333f834Be7d4f21D", // orbitalSunrise
];

const LPTokens = [
  [
    // polarLPTokens
    "0x3fa4d0145a0b6Ad0584B1ad5f61cB490A04d8242", // POLAR-NEAR
    "0xADf9D0C77c70FCb1fDB868F54211288fCE9937DF", // SPOLAR-NEAR
    "0x75890912E9bb373dD0aA57a3fe9eC748Bf923915", // POLAR-STNEAR
  ],
  [
    // ethernalLPTokens
    "0x81D77f8e86f65b9C0F393afe0FC743D888c2d4d7", // ETHERNAL-ETHEREUM
  ],
  [
    // orbitalLPTokens
    "0x7243cB5DBae5921c78A022110645a23a38ffBA5D", // ORBITAL-WBTC
  ],
  [
    // tripolarLPTokens
    "0x51488c4BcEEa96Ee530bC6093Bd0c00F9461fbb5", // TRIPOLAR-TRI
  ],
  [
    // uspLPTokens
    "0xa984B8062316AFE25c86576b0478E76E65FdF564", // USP-USDC
  ],
];

const singleStakeTokens = [
  "0x17cbd9C274e90C537790C51b4015a65cD015497e", // ETHERNAL
  "0x266437E6c7500A947012F19A3dE96a3881a0449E", // EBOND
  "0x3AC55eA8D2082fAbda674270cD2367dA96092889", // ORBITAL
  "0x192bdcdd7b95A97eC66dE5630a85967F6B79e695", // OBOND
  "0xa69d9Ba086D41425f35988613c156Db9a88a1A96", // USP
  "0xcE32b28c19C61B19823395730A0c7d91C671E54b", // USPBOND
  "0xf0f3b9Eee32b1F490A4b8720cf6F005d4aE9eA86", // POLAR
  "0x3a4773e600086A753862621A26a2E3274610da43", // PBOND
  "0x60527a2751A827ec0Adf861EfcAcbf111587d748", // TRIPOLAR
  "0x8200B4F47eDb608e36561495099a8caF3F806198", // TRIBOND
];

const pool2Total = async (_timestamp, _ethBlock, {[chain]: block}) => {
  return sumTokens2({ chain, block, owner: spolarRewardPool, tokens: LPTokens.flat(), resolveLP: true })
  let balances = {};
  let transform = (addr) => `${"aurora"}:${addr}`;

  for (let token of singleStakeTokens) {
    const tokenBalance = (
      await sdk.api.abi.call({
        abi: "erc20:balanceOf",
        chain: "aurora",
        target: token,
        params: [spolarRewardPool],
        block: chainBlocks["aurora"],
      })
    ).output;

    sdk.util.sumSingleBalance(balances, `aurora:${token}`, tokenBalance);
  }

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

const staking = async (_timestamp, _ethBlock, {[chain]: block}) => {
  const tokensAndOwners = []
  sunrises.forEach(o => tokensAndOwners.push([spolar, o]))
  singleStakeTokens.forEach(t => tokensAndOwners.push([t, spolarRewardPool]))
  return sumTokens2({ chain, block, tokensAndOwners })
};

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "Pool2 TVL accounts for all LPs staked in Dawn, Staking TVL accounts for all tokens staked in Sunrise.",
  aurora: {
    tvl: async () => ({}),
    pool2: pool2Total,
    staking,
  },
};
