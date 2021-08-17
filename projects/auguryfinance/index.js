const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformPolygonAddress } = require("../helper/portedTokens");

const MasterAugur = "0x6ad70613d14c34aa69E1604af91c39e0591a132e";

const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const poolLength = Number(
    (
      await sdk.api.abi.call({
        abi: abi.poolLength,
        target: MasterAugur,
        chain: "polygon",
        block: chainBlocks["polygon"],
      })
    ).output
  );

  const allPoolNums = Array.from(Array(poolLength).keys());

  const lpTokens = (
    await sdk.api.abi.multiCall({
      abi: abi.poolInfo,
      calls: allPoolNums.map((num) => ({
        target: MasterAugur,
        params: num,
      })),
      chain: "polygon",
      block: chainBlocks["polygon"],
    })
  ).output.map((lp) => lp.output[0]);

  const balance = (
    await sdk.api.abi.multiCall({
      abi: erc20.balanceOf,
      calls: lpTokens.map((lp) => ({
        target: lp,
        params: MasterAugur,
      })),
      chain: "polygon",
      block: chainBlocks["polygon"],
    })
  ).output.map((lp) => lp.output);

  const lpPositions = [];

  for (let index = 0; index < allPoolNums.length; index++) {
    if (index == 1 || index == 17 || index == 18) {
      lpPositions.push({
        token: lpTokens[index],
        balance: balance[index],
      });
    } else {
      sdk.util.sumSingleBalance(
        balances,
        `polygon:${lpTokens[index]}`,
        balance[index]
      );
    }
  }

  const transformAddress = await transformPolygonAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["polygon"],
    "polygon",
    transformAddress
  );

  return balances;
};

// ----- Treasury TVL -----
const treasuryTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const DeveloperTeamWallet = "0xE2E26BAc2ff37A7aE219EcEF74C5A1Bf95d5f854";

  /*** Tokens aren't in the file matic.json that exit in GitHub respository of the protocol ***/
  const amWMATIC = "0x8df3aad3a84da6b69a4da8aec3ea40d9091b2ac4";
  const OMEN = "0x76e63a3E7Ba1e2E61D3DA86a87479f983dE89a7E";
  const QUICK = "0x831753dd7087cac61ab5644b308642cc1c33dc13";

  const tokens_polygon = (
    await utils.fetchURL(
      "https://raw.githubusercontent.com/augury-finance/default-token-list/master/tokens/matic.json"
    )
  ).data.map((tokenAddress) => tokenAddress.address);

  tokens_polygon.push(amWMATIC, OMEN, QUICK);

  const balanceTreasury = (
    await sdk.api.abi.multiCall({
      abi: erc20.balanceOf,
      calls: tokens_polygon.map((tp) => ({
        target: tp,
        params: DeveloperTeamWallet,
      })),
      chain: "polygon",
      block: chainBlocks["polygon"],
    })
  ).output.map((lp) => lp.output);

  for (let index = 0; index < tokens_polygon.length; index++) {
    try {
      sdk.util.sumSingleBalance(
        balances,
        `polygon:${tokens_polygon[index]}`,
        balanceTreasury[index]
      );
    } catch (err) {}
  }

  return balances;
};

module.exports = {
  polygon: {
    tvl: polygonTvl,
  },
  treasury: {
    tvl: treasuryTvl,
  },
  tvl: sdk.util.sumChainTvls([polygonTvl, treasuryTvl]),
};
