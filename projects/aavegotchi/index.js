const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { pool2Exports } = require("../helper/pool2");
const { transformPolygonAddress } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const vaultContractETH = "0xFFE6280ae4E864D9aF836B562359FD828EcE8020";
const tokensETH = [
  // GHST
  "0x3F382DbD960E3a9bbCeaE22651E88158d2791550",
  // DAI
  "0x6b175474e89094c44da98b954eedeac495271d0f",
];

const polygonContracts = [
  // vaultContract
  "0xb208f8BB431f580CC4b216826AFfB128cd1431aB",
  // rarityFarmingContract
  "0x27DF5C6dcd360f372e23d5e63645eC0072D0C098",
];

const stkGHST_QUICKContract = "0xA02d547512Bb90002807499F05495Fe9C4C3943f";
const pools2 = [
    // WETH_GHST_UNIV2
    "0xccb9d2100037f1253e6c1682adf7dc9944498aff",
    // GHST_QUICK_UNIV2
    "0x8B1Fd78ad67c7da09B682c5392b65CA7CaA101B9",
    // GHST_USDC_UNIV2
    "0x096C5CCb33cFc5732Bcd1f3195C13dBeFC4c82f4"
]
const GHST_Polygon = "0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7";

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  for (const token of tokensETH) {
    await sumTokensAndLPsSharedOwners(
      balances,
      [[token, false]],
      [vaultContractETH]
    );
  }

  return balances;
};

const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  let transformAddress = await transformPolygonAddress();

  await sumTokensAndLPsSharedOwners(
    balances,
    [[GHST_Polygon, false]],
    polygonContracts,
    chainBlocks["polygon"],
    "polygon",
    transformAddress
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  staking_polygon: {
    tvl: staking(stkGHST_QUICKContract, GHST_Polygon, "polygon"),
  },
  pool2s: pool2Exports(stkGHST_QUICKContract, pools2, "polygon").tvl,
  ethereum: {
    tvl: ethTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl, polygonTvl]),
 
  methodology:
    `We count liquidity on Vaults from ETHEREUM and Polygon chains through Vault Contracts;
    On Rarity Farming, Staking and Pool2s parts on Polygon chain through their Contrats`,
};
