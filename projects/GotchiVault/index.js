const sdk = require('@defillama/sdk');
const { transformPolygonAddress } = require('../helper/portedTokens');
const abi = require("./abi.json");
const { request, gql } = require("graphql-request");
const { getBlock } = require('../helper/http')

const VGHST_CONTRACT = "0x51195e21BDaE8722B29919db56d95Ef51FaecA6C";
const GHST_CONTRACT = "0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7";
const VAULT_CONTRACT = "0xDd564df884Fd4e217c9ee6F65B4BA6e5641eAC63";

const graphUrl = 'https://subgraph.satsuma-prod.com/tWYl5n5y04oz/aavegotchi/aavegotchi-core-matic/api'
const graphQuery = gql`
query GET_SUMMONED_GOTCHIS ($minGotchiId: Int, $block: Int) {
  aavegotchis(
    first: 1000
    skip: 0
    block: { number: $block }
    where: {
      status: "3" # summoned gotchis
      gotchiId_gt: $minGotchiId
      owner: "${VAULT_CONTRACT.toLowerCase()}"
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

async function tvl(timestamp, _, chainBlocks) {
  const balances = {};
  const block = await getBlock(timestamp, 'polygon', chainBlocks)
  const transform = await transformPolygonAddress();

  const collateralBalance = (await sdk.api.abi.call({
    abi: abi.totalGHST,
    chain: 'polygon',
    target: VGHST_CONTRACT,
    params: [VGHST_CONTRACT],
    block,
  })).output;

  sdk.util.sumSingleBalance(balances, transform(GHST_CONTRACT), collateralBalance)

  const gotchisBalances = await getGotchisCollateral(timestamp, block-100);
  sdk.util.sumMultiBalanceOf(balances, gotchisBalances, true, x => 'polygon:' + x);


  return balances;
}

module.exports = {
  methodology:
    "TVL counts the total GHST tokens that are staked by the Gotchi Vault vGHST contracts, as well as the collateral tokens that are locked in the Aavegotchis deposited in the Gotchi Vault contract",
    polygon: {
    tvl,
  }
};