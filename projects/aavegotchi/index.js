const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { pool2Exports } = require("../helper/pool2");
const { transformPolygonAddress } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { request, gql } = require("graphql-request");

const vaultContractETH = "0xFFE6280ae4E864D9aF836B562359FD828EcE8020";
const tokensETH = [
  "0x3F382DbD960E3a9bbCeaE22651E88158d2791550", // GHST
  "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
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


const graphUrl = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic'
const graphQuery = gql`
query GET_SUMMONED_GOTCHIS ($minGotchiId: Int, $block: Int) {
  aavegotchis(
    first: 1000
    skip: 0
    block: { number: $block }
    where: {
      status: "3" # summoned gotchis
      gotchiId_gt: $minGotchiId
    }
    orderBy: gotchiId
    orderDirection: asc
  ) {
    gotchiId
    collateral
    stakedAmount
  }
}`
async function getGotchisCollateral(timestamp, block) {
  const allGotchis = [];
  let minGotchiId = 0;
  while (minGotchiId !== -1) {
    const { aavegotchis } = await request(
      graphUrl,
      graphQuery, 
      {minGotchiId, block}
    );
    if (aavegotchis && aavegotchis.length > 0) {
      minGotchiId = parseInt(aavegotchis[aavegotchis.length - 1].gotchiId);
      allGotchis.push(...aavegotchis);
    } else {
      minGotchiId = -1;
    }
  }
  const gotchisBalances = {
    output: allGotchis.map(g => ({
      input: {target: g.collateral},
      success: true,
      output: g.stakedAmount
    }))
  };

  const balances = {};
  sdk.util.sumMultiBalanceOf(balances, gotchisBalances, true, x => 'polygon:' + x);
  return gotchisBalances;
}

const polygonTvl = async (timestamp, block, chainBlocks) => {
  const balances = {};

  let transformAddress = await transformPolygonAddress();

  await sumTokensAndLPsSharedOwners(
    balances,
    [[GHST_Polygon, false]],
    vaultContractsPolygon,
    chainBlocks["polygon"],
    "polygon",
    transformAddress
  );

  const gotchisBalances = await getGotchisCollateral(timestamp, block);
  sdk.util.sumMultiBalanceOf(balances, gotchisBalances, true, x => 'polygon:' + x);

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  staking_polygon: {
    tvl: staking(stkGHST_QUICKContract, GHST_Polygon, "polygon"),
  },
  pool2s: pool2Exports(stkGHST_QUICKContract, GHST_pools2, "polygon").tvl,
  ethereum: {
    tvl: ethTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl, polygonTvl]),
  // tvl: getGotchisCollateral,
  methodology:
    `We count liquidity on Vaults from ETHEREUM and Polygon chains through Vault Contracts;
    On Rarity Farming, Staking and Pool2s parts on Polygon chain through their Contrats`,
};
