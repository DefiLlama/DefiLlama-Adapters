const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const {
  transformOptimismAddress,
  transformArbitrumAddress,
} = require("../helper/portedTokens");
const retry = require("../helper/retry");
const axios = require("axios");

// Ethereum
const ETH_BULL_VAULT = "0xad48a8261b0690c71b70115035eb14afd9a43242";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

// Optimism
const BASIS_TRADING_VAULT = "0xD576bE0d3CC1c0184d1ea3F1778A4A9Dec523859";
const OPT_USDC = "0x7F5c764cBc14f9669B88837ca1490cCa17c31607";

// Arbitrum
const DMO_LENDING_POOL = "0x4c51FF6AF2EfC679A08C5A7377Bce18050f86CcB";
const DMO_FACTORY = "0xcd8d2e1fa4132749220ffeec165285ee33028d59";
const DMO_FARM = "0x4a127cB6806E869bf61A6de9db76dabE46A837D3";
const DMO_FARM_ACTION = "0x4Ec4e76c11E2182918a80822df114DB03048388b";
const ARB_WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const ARB_USDC = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";

async function ethTvl(block) {
  return {
    [WETH]: (
      await sdk.api.abi.call({
        target: ETH_BULL_VAULT,
        block,
        abi: abi.totalAsset,
        chain: "ethereum",
      })
    ).output,
  };
}

async function optTvl(block) {
  const transform = await transformOptimismAddress();
  return {
    [transform(OPT_USDC)]: (
      await sdk.api.abi.call({
        target: BASIS_TRADING_VAULT,
        block,
        abi: abi.totalAssets,
        chain: "optimism",
      })
    ).output,
  };
}

async function getOpenPositionIds() {
  const response = (
    await retry(
      async () =>
        await axios.get(
          "https://0dtklop9zj.execute-api.ap-northeast-1.amazonaws.com/stag/open_positions?limit=500"
        )
    )
  ).data;

  const positionIds = response.records.map((position) => position.PositionId);

  return positionIds;
}

async function getTotalPositionValue(block) {
  let positionValues = 0;

  const openPositionIds = await getOpenPositionIds();

  await Promise.all(
    openPositionIds.map(async (id) => {
      const { positionValue } = (
        await sdk.api.abi.call({
          target: DMO_FACTORY,
          block,
          abi: abi.getPositionInfo,
          chain: "arbitrum",
          params: id,
        })
      ).output;

      positionValues += +positionValue;
    })
  );

  return positionValues;
}

async function arbTvl(block) {
  const transform = await transformArbitrumAddress();

  const balanceOfPool = +(
    await sdk.api.abi.call({
      target: DMO_LENDING_POOL,
      block,
      abi: abi.getCash,
      chain: "arbitrum",
    })
  ).output;

  const balanceOfFactory = +(
    await sdk.api.abi.call({
      target: ARB_USDC,
      block,
      abi: abi.balanceOf,
      chain: "arbitrum",
      params: DMO_FACTORY,
    })
  ).output;

  const positionValue = await getTotalPositionValue(block);

  const balanceOfFarm = +(
    await sdk.api.abi.call({
      target: DMO_FARM,
      block,
      abi: abi.totalAssets,
      chain: "arbitrum",
    })
  ).output;

  const balanceOfFarmAction = +(
    await sdk.api.abi.call({
      target: ARB_USDC,
      block,
      abi: abi.balanceOf,
      chain: "arbitrum",
      params: DMO_FARM_ACTION,
    })
  ).output;

  return {
    [transform(ARB_WETH)]: balanceOfPool,
    [transform(ARB_USDC)]:
      balanceOfFactory + positionValue + balanceOfFarm + balanceOfFarmAction,
  };
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  optimism: {
    tvl: optTvl,
  },
  arbitrum: {
    tvl: arbTvl,
  },
};
