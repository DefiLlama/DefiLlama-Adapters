const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformFantomAddress } = require("../helper/portedTokens");
const { staking } = require("../helper/staking");
const { pool2Exports } = require("../helper/pool2");

const token = "0xEb0a2D1b1a33D95204af5d00f65FD9e349419878";
const shares = "0xBda29437C8e5dC8BF6a2305D442A3742da7FB033";
const masonry = "0xDd1Fa691D2fd01FE9206b15350462b712B4AE371";
const rewardPool = "0x5331bE243A6AA35253b8bAe3E12157C6F5B61aDE";
const GenesisPoolsContract =
  "0x70c6586ab92744B9236D0C0A76A012d5164c589d";
const pool2LPs = [
  "0xd0EE9183F8717819c071bD3BDB77df37B7D4d16B", // FDOGE-WFTM spLP
  "0xbc9eF8F482ACf57CDa927f6Af39f5c513593aDFb", // SDOGE-WFTM spLP
];
const sdogeTvl = async (chainBlocks) => {
  const balances = {};

  const lpPositions = [];
  let poolInfoReturn = "";
  i = 0;
  do {
    try {
      const token = (
        await sdk.api.abi.call({
          abi: abi.poolInfo,
          target: GenesisPoolsContract,
          params: i,
          chain: "fantom",
          block: chainBlocks["fantom"],
        })
      ).output.token;

      const getTokenBalance = (
        await sdk.api.abi.call({
          abi: erc20.balanceOf,
          target: token,
          params: GenesisPoolsContract,
          chain: "fantom",
          block: chainBlocks["fantom"],
        })
      ).output;

      const getTokenSymbol = (
        await sdk.api.abi.call({
          abi: abi.symbol,
          target: token,
          chain: "fantom",
          block: chainBlocks["fantom"],
        })
      ).output;

      if (getTokenSymbol.includes("LP")) {
        lpPositions.push({
          token: token,
          balance: getTokenBalance,
        });
      } else {
        sdk.util.sumSingleBalance(
          balances,
          `fantom:${token.toLowerCase()}`,
          getTokenBalance
        );
      }
    } catch (error) {
      poolInfoReturn = error.reason;
    }
    i += 1;
  } while (poolInfoReturn != "missing revert data in call exception");

  const transformAddress = await transformFantomAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["fantom"],
    "fantom",
    transformAddress
  );

  return balances;
};

async function tvl(timestamp, block, chainBlocks) {
  let balances = await sdogeTvl(chainBlocks);
  delete balances[`fantom:${token}`];
  delete balances[`fantom:${shares}`];
  return balances;
}
async function stakings(timestamp, block, chainBlocks) {
  let [balances, coreTvl] = await Promise.all([
    staking(masonry, shares, "fantom")(timestamp, block, chainBlocks),
    sdogeTvl(chainBlocks),
  ]);
  balances[`fantom:${token}`] =
    `fantom:${token}` in balances
      ? Number(balances[`fantom:${token}`]) + Number(coreTvl[`fantom:${token}`])
      : coreTvl[`fantom:${token}`];
  balances[`fantom:${shares}`] =
    `fantom:${shares}` in balances
      ? Number(balances[`fantom:${shares}`]) +
        Number(coreTvl[`fantom:${shares}`])
      : Number(coreTvl[`fantom:${shares}`]);
  return balances;
}
module.exports = {
  fantom: {
    tvl,
    staking: stakings,
    pool2: pool2Exports(rewardPool, pool2LPs, "fantom"),
  },
};
