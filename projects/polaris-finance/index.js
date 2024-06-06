const { sumTokens2 } = require("../helper/unwrapLPs");
const { onChainTvl } = require("../helper/balancer");

const xpolar = "0xeAf7665969f1DaA3726CEADa7c40Ab27B3245993";
const xpolarRewardPool = "0x140e8a21d08cbb530929b012581a7c7e696145ef";
const chain = "aurora";

const sunrises = [
  "0xA452f676F109d34665877B7a7B203f2B445D7DE0", // polarSunrise
  "0x203a65b3153C55B57f911Ea73549ed0b8EC82B2D", // tripolarSunrise
  "0x37223e0066969027954a5499ea4445bB9F55b36F", // uspSunrise
  "0x33Fd42C929769f2C57cD68353Bff0bD7C6c51604", // ethernalSunrise
  "0x494E811678f84816878A6e7e333f834Be7d4f21D", // orbitalSunrise
  "0x5DB00aeFe6404A08802678480e953ACb32E14Eab", // binarisSunrise
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

const staking = async (_timestamp, _ethBlock, { [chain]: block }) => {
  const tokensAndOwners = [];
  sunrises.forEach((o) => tokensAndOwners.push([xpolar, o]));
  singleStakeTokens.forEach((t) => tokensAndOwners.push([t, xpolarRewardPool]));
  return sumTokens2({ chain, block, tokensAndOwners });
};

module.exports = {
    misrepresentedTokens: true,
  methodology:
    "Pool2 TVL accounts for all LPs staked in Dawn, Staking TVL accounts for all tokens staked in Sunrise.",
  aurora: {
    tvl: onChainTvl("0x6985436a0E5247A3E1dc29cdA9e1D89C5b59e26b", 71729132),
    staking,
  },
  telos: {
    tvl: onChainTvl("0x9Ced3B4E4DC978265484d1F1f569010E13f911c9", 319760799),
  },
};
