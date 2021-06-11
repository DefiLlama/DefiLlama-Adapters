const sdk = require("@defillama/sdk");
const retry = require("../helper/retry");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const {
  transformPolygonAddress,
  transformBscAddress,
} = require("../helper/portedTokens");
const axios = require("axios");

const abi = require("./abi.json");
const abip = require("./abip.json");
const erc20 = require("../helper/abis/erc20.json");

const ENDPOINT_IRON_FINANCE_POLYGON =
  "https://api.iron.finance/farms?network=polygon";
const ENDPOINT_IRON_FINANCE_BSC = "https://api.iron.finance/farms";

const TITAN_TOKEN = "0xaAa5B9e6c589642f98a1cDA99B9D024B8407285A";
const STEEL_TOKEN = "0x9001eE054F1692feF3A48330cB543b6FEc6287eb";

const infoAddresses = {
  bsc: "0xFE6F0534079507De1Ed5632E3a2D4aFC2423ead2",
  polygon: "0xD078B62f8D9f5F69a6e6343e3e1eC9059770B830",
};

const tvlCalc = async (
  chainBlocks,
  chain,
  tokenException,
  balances,
  endpoint
) => {
  const response = (await retry(async (bail) => await axios.get(endpoint)))
    .data;

  const pools = [
    ...response.pools.map((pool) => ({
      params: pool.masterChef,
      target: pool.lpToken,
    })),
    ...response.partnerPools.map((pool) => ({
      params: pool.partnerPoolAddress,
      target: pool.lpToken,
    })),
  ];

  const info = (
    await sdk.api.abi.call({
      target: infoAddresses[chain],
      abi: chain == "bsc" ? abi.info : abip.info,
      chain,
      block: chainBlocks[chain],
    })
  ).output;

  const collateralToken = (
    await sdk.api.abi.call({
      target: infoAddresses[chain],
      abi: chain == "bsc" ? abi.getCollateralToken : abip.collateral,
      chain,
      block: chainBlocks[chain],
    })
  ).output;

  sdk.util.sumSingleBalance(
    balances,
    `${chain}:${collateralToken}`,
    chain == "bsc" ? info[1] : info[0]
  );

  const poolBalanaces = (
    await sdk.api.abi.multiCall({
      abi: erc20.balanceOf,
      calls: pools,
      chain,
      block: chainBlocks[chain],
    })
  ).output.map((el) => el.output);

  let lpPositions = [];

  for (let i = 0; i < pools.length; i++) {
    lpPositions.push({
      token: pools[i].target,
      balance: poolBalanaces[i],
    });
  }

  // --- There are pools with single staking ---
  lpPositions.map((lp) => {
    if (lp.token == tokenException) {
      sdk.util.sumSingleBalance(
        balances,
        `${chain}:${tokenException}`,
        lp.balance
      );
    }
  });

  let transformAddress =
    chain == "bsc"
      ? await transformBscAddress()
      : await transformPolygonAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions.filter((pos) => pos.token != tokenException),
    chainBlocks[chain],
    chain,
    transformAddress
  );
};

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await tvlCalc(
    chainBlocks,
    "bsc",
    STEEL_TOKEN,
    balances,
    ENDPOINT_IRON_FINANCE_BSC
  );

  return balances;
};

const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await tvlCalc(
    chainBlocks,
    "polygon",
    TITAN_TOKEN,
    balances,
    ENDPOINT_IRON_FINANCE_POLYGON
  );

  return balances;
};

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl, polygonTvl]),
};
