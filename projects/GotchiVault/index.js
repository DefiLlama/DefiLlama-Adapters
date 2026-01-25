const abi = {
    "totalGHST": "function totalGHST(address _user) view returns (uint256 _totalGHST)",
    "tokenIdsOfOwner": "function tokenIdsOfOwner(address _owner) view returns (uint32[] tokenIds_)"
  };
const { request, gql } = require("graphql-request");

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
async function getGotchisCollateral(block, api) {
  let minGotchiId = 0;
  while (minGotchiId !== -1) {
    const { aavegotchis } = await request(
      graphUrl,
      graphQuery,
      { minGotchiId, block }
    );
    if (aavegotchis && aavegotchis.length > 0) {
      minGotchiId = parseInt(aavegotchis[aavegotchis.length - 1].gotchiId);
      aavegotchis.forEach(g => api.add(g.collateral, g.stakedAmount));
    } else {
      minGotchiId = -1;
    }
  }
}

async function tvl(api) {
  const block = await api.getBlock()

  const collateralBalance = await api.call({
    abi: abi.totalGHST,
    target: VGHST_CONTRACT,
    params: [VGHST_CONTRACT],
  })
  api.add(GHST_CONTRACT, collateralBalance)

  // return getGotchisCollateral(block - 100, api);
}

module.exports = {
  methodology:
    "TVL counts the total GHST tokens that are staked by the Gotchi Vault vGHST contracts, as well as the collateral tokens that are locked in the Aavegotchis deposited in the Gotchi Vault contract",
  polygon: {
    tvl,
  },
  deadFrom: '2025-10-10',
};