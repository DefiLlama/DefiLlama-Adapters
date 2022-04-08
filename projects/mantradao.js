const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("./helper/unwrapLPs");
const BigNumber = require("bignumber.js");
const {
  stakingAssetsETH,
  stakingAssetsBSC,
  stakingAssetsPOLYGON,
} = require("./config/mantra-dao/contracts/naked-staking-contracts");
const {
  lpStakingAssetsETH,
  lpStakingAssetsBSC,
  lpStakingAssetsPOLYGON,
} = require("./config/mantra-dao/contracts/lp-staking-contracts");
const {
  zenTokens,
  ZENTEREST_LENS_ADDRESS,
} = require("./config/mantra-dao/contracts/zen-asset-contracts");
const {
  BASE,
  EXP_DECIMALS,
  ZERO_INT,
  TWO_INT,
} = require("./config/mantra-dao/helper");
const NAKED_ABI = require("./config/mantra-dao/abis/NAKED_STAKING.json");
const ZENTEREST_LENS_ABI = require("./config/mantra-dao/abis/ZENTEREST_LENS_ABI.json");

async function getNakedStakingInfo(chain, asset, block) {
  const { output: assetTotalStaked } = await sdk.api.abi.call({
    block,
    target: asset.contract,
    abi: NAKED_ABI.totalStaked,
    chain: chain,
  });

  const { output: decimals } = await sdk.api.abi.call({
    block,
    abi: "erc20:decimals",
    target: asset.contract,
    chain: chain,
  });

  const totalStaked = BigNumber(assetTotalStaked)
    .div(BASE ** decimals)
    .toFixed(ZERO_INT);

  return totalStaked;
}

async function getLPStakingPositions(assetList, block, chain) {
  const { output: lpBalances } = await sdk.api.abi.multiCall({
    calls: assetList.map((p) => ({
      target: p.pairAddress,
      params: p.contract,
    })),
    abi: "erc20:balanceOf",
    block: block,
    chain: chain,
  });

  let lpPositions = [];

  lpBalances.forEach((p) => {
    lpPositions.push({
      token: p.input.target,
      balance: p.output,
    });
  });

  return lpPositions;
}

async function getZENTERESTInfo(chain, block) {
  const zenAdressList = zenTokens.map((asset) => asset.zenToken);
  const { output: tokensMetadata } = await sdk.api.abi.call({
    target: ZENTEREST_LENS_ADDRESS,
    params: [zenAdressList],
    abi: ZENTEREST_LENS_ABI.cTokenMetadataAll,
    block,
    chain: chain,
  });

  const { output: tokensUnderlyingPrices } = await sdk.api.abi.call({
    target: ZENTEREST_LENS_ADDRESS,
    params: [zenAdressList],
    abi: ZENTEREST_LENS_ABI.cTokenUnderlyingPriceAll,
    block,
    chain: chain,
  });

  return [tokensMetadata, tokensUnderlyingPrices];
}

async function calculateZenSupplyBorrow(
  tokensMetadata,
  tokensUnderlyingPrices
) {
  let totalSupplyETH = BigNumber(ZERO_INT);
  let totalBorrowsETH = BigNumber(ZERO_INT);

  tokensMetadata.forEach((asset) => {
    const zenToken = asset.cToken;
    const zenTokenDecimals = asset.cTokenDecimals;
    const underlyingDecimals = Number(asset.underlyingDecimals);
    const zenDecimalFactor = EXP_DECIMALS * TWO_INT - underlyingDecimals;
    const exchangeRateFactor =
      EXP_DECIMALS + underlyingDecimals - zenTokenDecimals;

    const underlyingPrice = tokensUnderlyingPrices.find(
      (token) => token.cToken === zenToken
    ).underlyingPrice;
    const underlyingPriceScaled = BigNumber(underlyingPrice)
      .div(BASE ** zenDecimalFactor)
      .toFixed();

    const exchangeRate = BigNumber(asset.exchangeRateCurrent).div(
      BASE ** exchangeRateFactor
    );

    const totalSupply = BigNumber(asset.totalSupply)
      .div(BASE ** zenTokenDecimals)
      .times(exchangeRate);

    const totalBorrows = BigNumber(asset.totalBorrows).div(
      BASE ** underlyingDecimals
    );

    totalSupplyETH = totalSupplyETH.plus(
      BigNumber(totalSupply).times(underlyingPriceScaled)
    );

    totalBorrowsETH = totalBorrowsETH.plus(
      BigNumber(totalBorrows).times(underlyingPriceScaled)
    );
  });

  return [totalSupplyETH.plus(totalBorrowsETH), totalBorrowsETH];
}

async function ethereumTVL(timestamp, ethBlock, chainBlocks) {
  let balances = {};

  await Promise.all(
    stakingAssetsETH.map(async (asset) => {
      const totalStaked = await getNakedStakingInfo(
        "ethereum",
        asset,
        chainBlocks["ethereum"]
      );

      sdk.util.sumSingleBalance(balances, asset.price, totalStaked);
    })
  );

  const lpPositions = await getLPStakingPositions(
    lpStakingAssetsETH,
    ethBlock,
    "ethereum"
  );
  await unwrapUniswapLPs(balances, lpPositions, ethBlock, "ethereum");

  const [tokensMetadata, tokensUnderlyingPrices] = await getZENTERESTInfo(
    "ethereum",
    ethBlock
  );

  const [totalZenTVL] = await calculateZenSupplyBorrow(
    tokensMetadata,
    tokensUnderlyingPrices
  );

  sdk.util.sumSingleBalance(
    balances,
    "ethereum",
    BigNumber(totalZenTVL).toFixed(ZERO_INT)
  );

  return balances;
}

async function bscTVL(timestamp,ethBlock, chainBlocks) {
  let balances = {};

  await Promise.all(
    stakingAssetsBSC.map(async (asset) => {
      const totalStaked = await getNakedStakingInfo(
        "bsc",
        asset,
        chainBlocks["bsc"]
      );

      sdk.util.sumSingleBalance(balances, asset.price, totalStaked);
    })
  );

  const lpPositions = await getLPStakingPositions(
    lpStakingAssetsBSC,
    chainBlocks.bsc,
    "bsc"
  );
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["bsc"],
    "bsc",
    (addr) => `bsc:${addr}`
  );

  return balances;
}

async function polygonTVL(timestamp, ethBlock, chainBlocks) {
  let balances = {};

  await Promise.all(
    stakingAssetsPOLYGON.map(async (asset) => {
      const totalStaked = await getNakedStakingInfo(
        "polygon",
        asset,
        chainBlocks["polygon"]
      );
      sdk.util.sumSingleBalance(balances, asset.price, totalStaked);
    })
  );

  const lpPositions = await getLPStakingPositions(
    lpStakingAssetsPOLYGON,
    chainBlocks.polygon,
    "polygon"
  );

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["polygon"],
    "polygon",
    (addr) => `polygon:${addr}`
  );

  return balances;
}

async function borrowed(timestamp, ethBlock, chainBlocks) {
  let borrows = {};
  const [tokensMetadata, tokensUnderlyingPrices] = await getZENTERESTInfo(
    "ethereum",
    ethBlock
  );

  const [, totalBorrowsETH] = await calculateZenSupplyBorrow(
    tokensMetadata,
    tokensUnderlyingPrices
  );

  sdk.util.sumSingleBalance(
    borrows,
    "ethereum",
    BigNumber(totalBorrowsETH).toFixed(ZERO_INT)
  );

  return borrows;
}

module.exports = {
  ethereum: {
    tvl: ethereumTVL,
    borrowed,
  },
  bsc: {
    tvl: bscTVL,
  },
  polygon: {
    tvl: polygonTVL,
  },
};
