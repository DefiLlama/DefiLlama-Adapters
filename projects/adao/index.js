const sdk = require("@defillama/sdk");
const { ApiPromise, WsProvider } = require("@polkadot/api");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const { getChainTransform } = require("../helper/portedTokens");

const ADAOTreasuryAddress = "0x9E5A8BB92C3E5A8bf5bad9c40a807dE4151311d1";
const ADAOStakingContract = "0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC";

async function tvl() {
  const ASTR_DECIMALS = 18;
  const provider = new WsProvider("wss://astar.api.onfinality.io/public-ws");
  const api = new ApiPromise({
    provider,
  });
  await api.isReady;
  const era = await api.query.dappsStaking.currentEra();
  // generalEraInfo eraRewardsAndStakes
  const infoApi =
    api.query.dappsStaking.eraRewardsAndStakes ??
    api.query.dappsStaking.generalEraInfo;
  const result = await api.query.dappsStaking.generalEraInfo(era);
  const tvl = result.unwrap().staked.valueOf();
  const AstrLocked = tvl / 10 ** ASTR_DECIMALS;

  return {
    astar: AstrLocked,
  };
}
const TOKENS = {
  WASTR: "0xEcC867DE9F5090F55908Aaa1352950b9eed390cD",
  WASTAR: "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720",
  VERSA: "0xB9dEDB74bd7b298aBf76b9dFbE5b62F0aB05a57b",
  USDC: "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98",
  BUSD: "0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E",
};

async function treasury(timestamp, block, chainBlocks) {
  const balances = {};

  const transformAddress = await getChainTransform("astar");

  await sumTokensAndLPsSharedOwners(
    balances,
    Object.values(TOKENS).map((v) => [v, false]),
    [ADAOTreasuryAddress],
    chainBlocks["astar"],
    "astar",
    transformAddress
  );
  return balances;
}
const masterChef = "0xe6930A2a844d94f4C03d383311945AB03c88741a";
module.exports = {
  methodology:
    "A-DAO will be based on dApp staking of Astar Network. Users will get some of the developer rewards while participating and gaining basic rewards. At present, A-DAO divides the developer rewards into: Revenue Reward, On-chain Treasury, Incubation Fund, any rewards of which can be adjusted by DAO governance.",
  astar: {
    tvl,
    treasury,
    staking: staking(
      masterChef,
      ADAOStakingContract,
      "astar",
      ADAOStakingContract,
      0
    ),
  },
};
