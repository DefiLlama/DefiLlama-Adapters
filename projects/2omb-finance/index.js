const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformFantomAddress } = require("../helper/portedTokens");
const { staking } = require("../helper/staking");
const { pool2Exports } = require("../helper/pool2");

const token = "0x7a6e4e3cc2ac9924605dca4ba31d1831c84b44ae";
const shares = "0xc54a1684fd1bef1f077a336e6be4bd9a3096a6ca";
const masonry = "0x627A83B6f8743c89d58F17F994D3F7f69c32F461";
const rewardPool = "0x8D426Eb8C7E19b8F13817b07C0AB55d30d209A96";
const ThreeOmbGenesisPoolsContract =
  "0xcB0b0419E6a1F46Be89C1c1eeeAf9172b7125b29";
const pool2LPs = [
  "0xbdC7DFb7B88183e87f003ca6B5a2F81202343478", // 2OMB-FTM spLP
  "0x6398ACBBAB2561553a9e458Ab67dCFbD58944e52", // 2SHARE-WFTM spLP
];
const omb3Tvl = async (chainBlocks) => {
  const balances = {};

  const lpPositions = [];
  let poolInfoReturn;
  let i = 0;
  do {
    try {
      const token = (
        await sdk.api.abi.call({
          abi: abi.poolInfo,
          target: ThreeOmbGenesisPoolsContract,
          params: i,
          chain: "fantom",
          block: chainBlocks["fantom"],
        })
      ).output.token;

      const getTokenBalance = (
        await sdk.api.abi.call({
          abi: 'erc20:balanceOf',
          target: token,
          params: ThreeOmbGenesisPoolsContract,
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
  } while (!poolInfoReturn);

  if (!Object.keys(balances).length)  throw new Error('Bad length, something is wrong')

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
// node test.js projects/2omb-finance/index.js
async function tvl(timestamp, block, chainBlocks) {
  let balances = await omb3Tvl(chainBlocks);
  delete balances[`fantom:${token}`];
  delete balances[`fantom:${shares}`];
  return balances;
}
async function stakings(timestamp, block, chainBlocks) {
  let [balances, coreTvl] = await Promise.all([
    staking(masonry, shares, "fantom")(timestamp, block, chainBlocks),
    omb3Tvl(chainBlocks),
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
