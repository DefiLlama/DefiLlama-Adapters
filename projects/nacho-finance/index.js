const sdk = require("@defillama/sdk");
const axios = require("axios");
const { transformPolygonAddress } = require("../helper/portedTokens");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const tombTokenAddress = "0xcD86152047e800d67BDf00A4c635A8B6C0e5C4c2";
const tshareTokenAddress = "0x948D0a28b600BDBd77AF4ea30E6F338167034181";

const tombFtmLpAddress = "0x8d25fec513309f2d329d99d6f677d46c831fdee8";
const tshareFtmLpAddress = "0x1c84cd20ea6cc100e0a890464411f1365ab1f664";

const masonryAddress = "0x1ad667aCe03875fe48534c65BFE14191CF81fd64";
const tshareRewardPoolAddress = "0xdD694F459645eb6EfAE934FE075403760eEb9aA1";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  let lpPositions = [];
  let transformAddress = await transformPolygonAddress();

  // Masonry TVL
  const masonryBalance = sdk.api.erc20
    .balanceOf({
      target: tshareTokenAddress,
      owner: masonryAddress,
      block: chainBlocks["polygon"],
      chain: "polygon",
    });
  sdk.util.sumSingleBalance(
    balances,
    transformAddress(tshareTokenAddress),
    (await masonryBalance).output
  );

  // Cemetery TOMB-FTM LP TVL
  const tombFtmLpCemeteryBalance = sdk.api.erc20
    .balanceOf({
      target: tombFtmLpAddress,
      owner: tshareRewardPoolAddress,
      block: chainBlocks["polygon"],
      chain: "polygon",
    });

  lpPositions.push({
    token: tombFtmLpAddress,
    balance: (await tombFtmLpCemeteryBalance).output,
  });

  // Cemetery TSHARE-FTM LP TVL
  const tshareFtmLpCemeteryBalance = sdk.api.erc20
    .balanceOf({
      target: tshareFtmLpAddress,
      owner: tshareRewardPoolAddress,
      block: chainBlocks["polygon"],
      chain: "polygon",
    });

  lpPositions.push({
    token: tshareFtmLpAddress,
    balance: (await tshareFtmLpCemeteryBalance).output,
  });

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["polygon"],
    "polygon",
    transformAddress
  );
  return balances;
}

module.exports = {
  methodology: 'The TVL of Nacho Finance is calculated using the Quickswap LP token deposits(NACHO/ETH and NSHARE/MATIC), and the NSHSARE deposits found in the Bowl contract.',
  polygon: {
    tvl,
  },
  tvl,
};
