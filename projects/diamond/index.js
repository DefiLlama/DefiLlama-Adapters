const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { get } = require('../helper/http')
const { getConfig } = require('../helper/cache')

// Ethereum
const ETH_BULL_VAULT = "0xad48a8261b0690c71b70115035eb14afd9a43242";

// Optimism
const BASIS_TRADING_VAULT = "0xD576bE0d3CC1c0184d1ea3F1778A4A9Dec523859";
const OPT_USDC = ADDRESSES.optimism.USDC;

// Arbitrum
const DMO_LENDING_POOL = "0x4c51FF6AF2EfC679A08C5A7377Bce18050f86CcB";
const DMO_FACTORY = "0xcd8d2e1fa4132749220ffeec165285ee33028d59";
const DMO_FARM = "0x4a127cB6806E869bf61A6de9db76dabE46A837D3";
const DMO_FARM_ACTION = "0x4Ec4e76c11E2182918a80822df114DB03048388b";
const ARB_WETH = ADDRESSES.arbitrum.WETH;
const ARB_USDC = ADDRESSES.arbitrum.USDC;

async function ethTvl(_, block) {
  return {
    ['ethereum:' + ADDRESSES.ethereum.WETH]: (
      await sdk.api.abi.call({
        target: ETH_BULL_VAULT,
        block,
        abi: abi.totalAsset,
        chain: "ethereum",
      })
    ).output,
  };
}

async function optTvl(_, _b,{ optimism: block}) {
  return {
    ['optimism:'+OPT_USDC]: (
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
  const response = await getConfig('diamond/arbi-open-positions',
          "https://0dtklop9zj.execute-api.ap-northeast-1.amazonaws.com/stag/open_positions?limit=500"
        )

  const positionIds = response.records.map((position) => position.PositionId);

  return positionIds;
}

async function getTotalPositionValue(block) {
  let positionValues = 0;

  const openPositionIds = await getOpenPositionIds();

  await Promise.all(
    openPositionIds.map(async (id) => {
      try {

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
      } catch (e) {
        console.log('trouble fetchng info for ', id)
        console.error(e)
      }
    })
  );

  return positionValues;
}

async function arbTvl(_, _b,{ arbitrum: block}) {
  const balanceOfPool = +(
    await sdk.api.abi.call({
      target: DMO_LENDING_POOL,
      block,
      abi: abi.getCash,
      chain: "arbitrum",
    })
  ).output;
  const balanceOfFarm = +(
    await sdk.api.abi.call({
      target: DMO_FARM,
      block,
      abi: abi.totalAssets,
      chain: "arbitrum",
    })
  ).output;

  const positionValue = await getTotalPositionValue(block);

  const balances = {
    ['arbitrum:'+ARB_WETH]: balanceOfPool,
    ['arbitrum:'+ARB_USDC]: positionValue + balanceOfFarm,
  }

  return sumTokens2({
    balances,
    owners: [DMO_FACTORY, DMO_FARM_ACTION, ],
    tokens: [ARB_USDC],
    chain: 'arbitrum',
    block,
  })
}

module.exports = {
  misrepresentedTokens: true,
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
