const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const utils = require("../helper/utils");
const { unwrapUniswapLPs, unwrapCrv } = require("../helper/unwrapLPs");
const { transformPolygonAddress } = require("../helper/portedTokens");

const jars_url =
  "https://stkpowy01i.execute-api.us-west-1.amazonaws.com/prod/protocol/pools";

const ethTvl = async (timestamp, block, chainBlocks) => {
  const balances = {};

  let jars = (await utils.fetchURL(jars_url)).data
    .map(jar => {
      if (jar.network === "eth")
        return {
          jarAddress: jar.jarAddress,
          tokenAddress: jar.tokenAddress,
          name: jar.identifier
        };
    })
    .filter(x => x);

  const jar_balances = (
    await sdk.api.abi.multiCall({
      block,
      calls: jars.map(jar => ({
        target: jar.jarAddress
      })),
      abi: abi.balance
    })
  ).output.map(val => val.output);

  const lpPositions = [];

  await Promise.all(
    jars.map(async (jar, idx) => {
      if (jar.name.toLowerCase().includes("crv") && jar.name != "yvecrv-eth") {
        await unwrapCrv(
          balances,
          jar.tokenAddress,
          jar_balances[idx],
          block,
        );
      } else if (jar.name.includes("-")) {
        lpPositions.push({
          balance: jar_balances[idx],
          token: jar.tokenAddress
        });
      } else {
        sdk.util.sumSingleBalance(
          balances,
          jar.tokenAddress,
          jar_balances[idx]
        );
      }
    })
  );
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block
  );

  return balances;
};

const polygonTvl = async (timestamp, block, chainBlocks) => {
  const balances = {};

  let jars = (await utils.fetchURL(jars_url)).data
    .map(jar => {
      if (jar.network === "polygon")
        return {
          jarAddress: jar.jarAddress,
          tokenAddress: jar.tokenAddress,
          name: jar.identifier
        };
    })
    .filter(x => x);

  const jar_balances = (
    await sdk.api.abi.multiCall({
      chain: "polygon",
      block: chainBlocks["polygon"],
      calls: jars.map(jar => ({
        target: jar.jarAddress
      })),
      abi: abi.balance
    })
  ).output.map(val => val.output);

  const lpPositions = [];

  const transformAddress = await transformPolygonAddress();
  await Promise.all(
    jars.map(async (jar, idx) => {
      if (jar.name.toLowerCase().includes("crv")) {
        await unwrapCrv(
          balances,
          jar.tokenAddress,
          jar_balances[idx],
          chainBlocks["polygon"],
          "polygon",
          transformAddress
        );
      } else if (jar.name.includes("-")) {
        lpPositions.push({
          balance: jar_balances[idx],
          token: jar.tokenAddress
        });
      } else {
        sdk.util.sumSingleBalance(
          balances,
          `polygon:${jar.tokenAddress}`,
          jar_balances[idx]
        );
      }
    })
  );

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["polygon"],
    "polygon",
    transformAddress
  );

  return balances;
};

module.exports = {
  ethereum:{
    tvl: ethTvl
  },
  polygon: {
    tvl: polygonTvl
  },
  tvl: sdk.util.sumChainTvls([ethTvl, polygonTvl])
};
