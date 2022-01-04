const sdk = require("@defillama/sdk");
const _ = require("underscore");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformBscAddress } = require("../helper/portedTokens");
const tvlOnPairs = require("../helper/processPairs.js");

const abi = require("./abi.json");
const abiFork = require("../inverse/abi.json");
const utils = require("../helper/utils");

const url = "https://api.bdollar.fi/api/bvault/get-vaults";

const BDEX_FACTORY = "0x2C358A7C62cdb9D554A65A86EEa034bc55D1E715";
const COMPTROLLER = "0xEEea0D4aAd990c4ede8e064A8Cb0A627B432EDa0";
const ibBNB = "0xa3948B027f94Ca195eAC645746435Aaa7eB555a7";

async function bscTvl(timestamp, chainBlocks) {
  let balances = {};

  // --- bVaults & bDollar TVL section, all contract addresses grab from endpoint ---
  // --- Sections of boardroom is not considered in TVL (bDollar Shares related) ---
  let vaultsInfo = (await utils.fetchURL(url)).data.data.vaultInfos;

  const keys = Object.keys(vaultsInfo);

  const strategies = [];

  keys.forEach((key) => {
    strategies.push({
      address: vaultsInfo[key].strategy,
      token: vaultsInfo[key].token,
    });
  });

  let wantedLocked = (
    await sdk.api.abi.multiCall({
      block: chainBlocks["bsc"],
      calls: strategies.map((strategy) => ({ target: strategy.address })),
      abi: abi.wantLockedTotal,
      chain: "bsc",
    })
  ).output.map((el) => el.output);

  let wantedAddresses = (
    await sdk.api.abi.multiCall({
      block: chainBlocks["bsc"],
      calls: strategies.map((strategy) => ({ target: strategy.address })),
      abi: abi.wantAddress,
      chain: "bsc",
    })
  ).output.map((el) => el.output);

  const transformAdress = await transformBscAddress();

  const lpPositions = [];

  strategies.map((strategy, idx) => {
    if (
      strategy.token.includes("CakeLP") ||
      strategy.token.includes("BLP") ||
      strategy.token.includes("CLP") ||
      strategy.token.includes("vBSWAP") ||
      strategy.token.includes("VLP") && strategy.token !== "VLP_BDO_VDOLLAR"
    ) {
      lpPositions.push({
        token: wantedAddresses[idx],
        balance: wantedLocked[idx],
      });
    } else {
      // apparently this strategy in the endpoint states 0 tvl, so it is filter out
      if (!strategy.token.includes("ibBUSD")) {
        sdk.util.sumSingleBalance(
          balances,
          `bsc:${wantedAddresses[idx]}`,
          wantedLocked[idx]
        );
      }
    }
  });

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["bsc"],
    "bsc",
    transformAdress
  );

  // --- bLending TVL section ---
  let markets = (
    await sdk.api.abi.call({
      block: chainBlocks["bsc"],
      chain: "bsc",
      target: COMPTROLLER,
      params: [],
      abi: abiFork.getAllMarkets,
    })
  ).output.filter((market) => market != ibBNB);

  let getAllCash = (
    await sdk.api.abi.multiCall({
      block: chainBlocks["bsc"],
      chain: "bsc",
      calls: _.map(markets, (market) => ({
        target: market,
      })),
      abi: abiFork.getCash,
    })
  ).output.map((cash) => cash.output);

  let allUnderlying = (
    await sdk.api.abi.multiCall({
      block: chainBlocks["bsc"],
      chain: "bsc",
      calls: _.map(markets, (market) => ({
        target: market,
      })),
      abi: abiFork.underlying,
    })
  ).output.map((underlying) => underlying.output);

  getAllCash.forEach((cashVal, idx) => {
    sdk.util.sumSingleBalance(balances, `bsc:${allUnderlying[idx]}`, cashVal);
  });

  // missing market without underlying aka BNB
  let getCash = (
    await sdk.api.abi.call({
      block: chainBlocks["bsc"],
      chain: "bsc",
      target: ibBNB,
      params: [],
      abi: abiFork.getCash,
    })
  ).output;

  sdk.util.sumSingleBalance(
    balances,
    "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    getCash
  );

  // --- bDex TVL section ---
  await tvlOnPairs("bsc", chainBlocks, BDEX_FACTORY, balances);

  return balances;
}

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
};
