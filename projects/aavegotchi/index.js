const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");

const vaultContractETH = "0xFFE6280ae4E864D9aF836B562359FD828EcE8020";
const tokensETH = [
  "0x3F382DbD960E3a9bbCeaE22651E88158d2791550", // GHST
  ADDRESSES.ethereum.DAI, // DAI
];

const vaultContractsPolygon = [
  "0xb208f8BB431f580CC4b216826AFfB128cd1431aB", // vaultContract
  "0x27DF5C6dcd360f372e23d5e63645eC0072D0C098", // rarityFarmingContract
];

const GHST_Polygon = "0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7";
const stkGHST_QUICKContract = "0xA02d547512Bb90002807499F05495Fe9C4C3943f";
const GHST_pools2 = [
  "0xccb9d2100037f1253e6c1682adf7dc9944498aff", // WETH_GHST_UNIV2
  "0x8B1Fd78ad67c7da09B682c5392b65CA7CaA101B9", // GHST_QUICK_UNIV2
  "0x096C5CCb33cFc5732Bcd1f3195C13dBeFC4c82f4"  // GHST_USDC_UNIV2
]

const ethTvl = async (api) =>  api.sumTokens({ owner: vaultContractETH, tokens: tokensETH })

// gotchi collateral is no longer counted: the protocol migrated to base, the aavegotchi-core-matic
// subgraph was deleted, and the polygon diamond no longer holds any collateral aTokens onchain
const polygonTvl = async (api) => {
  await api.sumTokens({ owners: vaultContractsPolygon, tokens: [GHST_Polygon] })
};

module.exports = {
  timetravel: false,
  ethereum: {
    tvl: ethTvl,
  },
  polygon: {
    tvl: polygonTvl,
    staking: staking(stkGHST_QUICKContract, GHST_Polygon),
    pool2: staking([stkGHST_QUICKContract], GHST_pools2)
  },
  methodology:
    `We count liquidity on Vaults from ETHEREUM and Polygon chains through Vault Contracts;
    On Rarity Farming, Staking and Pool2s parts on Polygon chain through their Contrats`,
  hallmarks: [
    ['2021-06-15', "Rarity Farming S1 Final Round"],
    ['2021-12-07', "Rarity Farming S2 Final Round"],
    ['2022-04-21', "Rarity Farming S3 Final Round"],
  ],
};
