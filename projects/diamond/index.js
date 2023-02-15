const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { get } = require("../helper/http");

// Ethereum
const ETH_BULL_VAULT = "0xad48a8261b0690c71b70115035eb14afd9a43242";

// Optimism
const BASIS_TRADING_VAULT = "0xD576bE0d3CC1c0184d1ea3F1778A4A9Dec523859";
const OPT_USDC = "0x7F5c764cBc14f9669B88837ca1490cCa17c31607";

// Unibot V1 - Arbitrum
const DMO_LENDING_POOL = "0x4c51FF6AF2EfC679A08C5A7377Bce18050f86CcB";
const DMO_FACTORY = "0xcd8d2e1fa4132749220ffeec165285ee33028d59";
const DMO_FARM = "0x4a127cB6806E869bf61A6de9db76dabE46A837D3";
const DMO_FARM_ACTION = "0x4Ec4e76c11E2182918a80822df114DB03048388b";

// Unibot V2 - Arbitrum
const BALANCE_VAULT = "0x8610D60f5329B0560c8F0CEb80175F342fe943F3";
const LENDING_POOLS = {
  WETH: "0xEdD1efA76fe59e9106067D824b89B59157C5223C",
};
const HELPER = "0x1011092BEC3f94B8f80E1b4965C8f53789ec184f";
const ARB_TOKENS = {
  WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
  GMX: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
};
const UNISWAP_POOLS = {
  "WETH/USDC": "0xc31e54c7a869b9fcbecc14363cf510d1c41fa443",
  "WETH/GMX": "0x80a9ae39310abf666a87c743d6ebbd0e8c42158e",
};

async function ethTvl(_, block) {
  return {
    "ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": (
      await sdk.api.abi.call({
        target: ETH_BULL_VAULT,
        block,
        abi: abi.totalAsset,
        chain: "ethereum",
      })
    ).output,
  };
}

async function optTvl(_, _b, { optimism: block }) {
  return {
    ["optimism:" + OPT_USDC]: (
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
  const response = await get(
    "https://0dtklop9zj.execute-api.ap-northeast-1.amazonaws.com/stag/open_positions?limit=500"
  );

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
        console.log("trouble fetchng info for ", id);
        console.error(e);
      }
    })
  );

  return positionValues;
}

async function getUnibotV2Factories() {
  const res = await get(
    "https://58mbg6291h.execute-api.ap-northeast-1.amazonaws.com/stag/api/v1/diamond_factory?chain=arbitrum"
  );
  return res.data;
}

async function getUnibotV2PositionIds(factoryId) {
  const positionIds = [];

  const getPositionIdsOfFactory = async (pageNum) => {
    const res = await get(
      `https://58mbg6291h.execute-api.ap-northeast-1.amazonaws.com/stag/api/v1/diamond_factory/${factoryId}/positions?limit=10&page=${pageNum}&type=open`
    );
    const { records, total_page } = res;
    positionIds.push(...records.map((position) => position.PositionId));

    if (total_page > pageNum) {
      await getPositionIdsOfFactory(pageNum + 1);
    }
  };

  await getPositionIdsOfFactory(1);

  return positionIds;
}

async function getUnibotV2FactoriesTvl(block) {
  const factories = await getUnibotV2Factories();

  const tokensTvl = {};

  await Promise.all(
    factories.map(async (pos) => {
      const positionIds = await getUnibotV2PositionIds(pos.ID);
      const borrowTokenSymbol = pos.Pairs.split("/")[0];
      const wantTokenSymbol = pos.Pairs.split("/")[1].split("-")[0];

      const oracleTimeWeightedSec = +(
        await sdk.api.abi.call({
          target: pos.ContractAddr,
          block,
          abi: abi.oracleTimeWeightedSec,
          chain: "arbitrum",
        })
      ).output;

      await Promise.all(
        positionIds.map(async (positionId) => {
          const positionValueMeasuredInWantToken = +(
            await sdk.api.abi.call({
              target: HELPER,
              block,
              abi: abi.getPositionValueMeasuredInWantToken,
              chain: "arbitrum",
              params: [
                ARB_TOKENS[wantTokenSymbol],
                ARB_TOKENS[borrowTokenSymbol],
                UNISWAP_POOLS[`${borrowTokenSymbol}/${wantTokenSymbol}`],
                positionId,
                false,
                oracleTimeWeightedSec,
              ],
            })
          ).output;

          if (tokensTvl[ARB_TOKENS[wantTokenSymbol]]) {
            tokensTvl[ARB_TOKENS[wantTokenSymbol]] +=
              positionValueMeasuredInWantToken;
          } else {
            tokensTvl[ARB_TOKENS[wantTokenSymbol]] =
              positionValueMeasuredInWantToken;
          }
        })
      );
    })
  );

  return tokensTvl;
}

async function getUnibotV2LendingPoolsTvl(block) {
  const poolKeys = Object.keys(LENDING_POOLS);

  const tokensTvl = {};

  await Promise.all(
    poolKeys.map(async (poolKey) => {
      const cashInPool = +(
        await sdk.api.abi.call({
          target: LENDING_POOLS[poolKey],
          block,
          abi: abi.getCash,
          chain: "arbitrum",
        })
      ).output;

      if (tokensTvl[ARB_TOKENS[poolKey]]) {
        tokensTvl[ARB_TOKENS[poolKey]] += cashInPool;
      } else {
        tokensTvl[ARB_TOKENS[poolKey]] = cashInPool;
      }
    })
  );

  return tokensTvl;
}

async function getUnibotV2BalanceVaultTvl(block) {
  const tokenKeys = Object.keys(ARB_TOKENS);

  const tokensTvl = {};

  await Promise.all(
    tokenKeys.map(async (tokenKey) => {
      const balanceInVault = +(
        await sdk.api.abi.call({
          target: ARB_TOKENS[tokenKey],
          block,
          abi: abi.balanceOf,
          chain: "arbitrum",
          params: BALANCE_VAULT,
        })
      ).output;

      if (tokensTvl[ARB_TOKENS[tokenKey]]) {
        tokensTvl[ARB_TOKENS[tokenKey]] += balanceInVault;
      } else {
        tokensTvl[ARB_TOKENS[tokenKey]] = balanceInVault;
      }
    })
  );

  return tokensTvl;
}

async function getUnibotV2Tvl(block) {
  const tokensTvl = {};

  const factoriesTvlObj = await getUnibotV2FactoriesTvl(block);
  Object.keys(factoriesTvlObj).forEach((token) => {
    if (tokensTvl[token]) {
      tokensTvl[token] += factoriesTvlObj[token];
    } else {
      tokensTvl[token] = factoriesTvlObj[token];
    }
  });

  const lendingPoolsTvlObj = await getUnibotV2LendingPoolsTvl(block);
  Object.keys(lendingPoolsTvlObj).forEach((token) => {
    if (tokensTvl[token]) {
      tokensTvl[token] += lendingPoolsTvlObj[token];
    } else {
      tokensTvl[token] = lendingPoolsTvlObj[token];
    }
  });

  const balanceVaultTvlObj = await getUnibotV2BalanceVaultTvl(block);
  Object.keys(balanceVaultTvlObj).forEach((token) => {
    if (tokensTvl[token]) {
      tokensTvl[token] += balanceVaultTvlObj[token];
    } else {
      tokensTvl[token] = balanceVaultTvlObj[token];
    }
  });

  return tokensTvl;
}

async function arbTvl(_, _b, { arbitrum: block }) {
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

  const unibotV2Tvl = await getUnibotV2Tvl(block);

  const balances = {
    ["arbitrum:" + ARB_TOKENS.WETH]:
      balanceOfPool + unibotV2Tvl[ARB_TOKENS.WETH],
    ["arbitrum:" + ARB_TOKENS.USDC]:
      positionValue + balanceOfFarm + unibotV2Tvl[ARB_TOKENS.USDC],
    ["arbitrum:" + ARB_TOKENS.GMX]: unibotV2Tvl[ARB_TOKENS.GMX],
  };

  return sumTokens2({
    balances,
    owners: [DMO_FACTORY, DMO_FARM_ACTION],
    tokens: [ARB_TOKENS.USDC],
    chain: "arbitrum",
    block,
  });
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
