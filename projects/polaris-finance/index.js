const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");

const BigNumber = require("bignumber.js");
const { GraphQLClient, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");
const { getBlock } = require("../helper/http");

const endpoint =
  "https://api.thegraph.com/subgraphs/name/polarisfinance/polaris-dex";

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

const LPTokens = [
  [
    // seigniorage
    "0xd88a378abfe6b6e232525dfb03fbe01ecc863c10",
    "0xa83f9fa9b51fc26e9925a07bc3375617b473e051",
    "0xa215a58225b344cbb62fcf762e8e884dbedfbe58",
    "0x293bbbef6087f681a8110f08bbdedadd13599fc3",
    "0x0993fa12d3256e85da64866354ec3532f187e178",
    "0xf0b6cf745afe642c4565165922ad62d6a93857c1",
  ],
  [
    // classic
    "0x244caf21eaa7029db9d6b42ddf2d95800a2f5eb5",
    "0x9cd44e44e8a61bc7dc34b04c762a3c0137a3707c",
    "0xfbfcd8d689a3689db0f35277bf7cc11663a672e0",
    "0xb3a04902b78fbe61185b766866193630db4db8a3",
    "0x24f58ab36c212e54b248ebfb17eff2ca21dc95d5",
    "0x4200333dc021ea5fb1050b8e4f8f3ed7cb1d22ed",
    "0xd8e9e1916a4d98fb0dc6db725a8c8c2af08a329b",
    "0x8bd71de52a3be3aadeb375f8d69aed37adf83d80",
    "0xceecce984f498ee00832670e9ca6d372f6ce155a",
    "0x23a8a6e5d468e7acf4cc00bd575dbecf13bc7f78",
    "0x454adaa07eec2c432c0df4379a709b1fa4c800ed",
    "0x89cc63050ade84bffafd7ec84d24fc0feb5f96c9",
    "0xe370d4d0727d4e9b70db1a2f7d2efd1010ff1d6d",
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

async function getTVL(block) {
  // delayed by around 5 mins to allow subgraph to update
  block -= 100;
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    query get_tvl($block: Int) {
      pools(
        orderBy: totalLiquidity
        orderDirection: desc
        block: { number: $block }
      ) {
        id
        name
        owner
        address
        totalLiquidity
      }
    }
  `;
  const results = await graphQLClient.request(query, {
    block,
  });

  results.pools.forEach((i) => {
    if (+i.totalLiquidity > 1e10) console.log("bad pool: ", i);
  });
  return results.pools
    .map((i) => +i.totalLiquidity)
    .filter((i) => i < 1e10) // we filter out if liquidity is higher than 10B as it is unlikely/error
    .reduce((acc, i) => acc + i, 0);
}

async function dexTVL(timestamp, ethBlock, chainBlocks) {
  console.log(getBlock);
  return toUSDTBalances(
    await getTVL(await getBlock(timestamp, "aurora", chainBlocks))
  );
}

const staking = async (_timestamp, _ethBlock, { [chain]: block }) => {
  const tokensAndOwners = [];
  sunrises.forEach((o) => tokensAndOwners.push([xpolar, o]));
  singleStakeTokens.forEach((t) => tokensAndOwners.push([t, xpolarRewardPool]));
  return sumTokens2({ chain, block, tokensAndOwners });
};

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "Pool2 TVL accounts for all LPs staked in Dawn, Staking TVL accounts for all tokens staked in Sunrise.",
  aurora: {
    tvl: dexTVL,
    staking,
  },
};
