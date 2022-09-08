const { default: BigNumber } = require("bignumber.js");
const { parseEther } = require("ethers/lib/utils");
const { request, gql } = require("graphql-request");
const axios = require("axios");
const sdk = require('@defillama/sdk')

const graphUrl = 'https://api.studio.thegraph.com/query/30874/openskyfinancefallback/v0.0.2'

const graphReservesQuery = gql`
query GET_RESERVES {
  reserves {
    id name symbol underlyingAsset oTokenAddress totalDeposits totalAmountOfBespokeLoans totalAmountOfInstantLoans interestPerSecondOfInstantLoans
  }
}
`;

const graphCollectionsQuery = gql`
query GET_COLLECTION_LOANS ($limit: Int) {
  collections(first: $limit) {
    id
		numberOfBespokeLoans
    numberOfInstantLoans
  }
}
`;

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  const { reserves } = await request(graphUrl, graphReservesQuery);

  reserves.forEach(i => {
    sdk.util.sumSingleBalance(balances, i.underlyingAsset, BigNumber(i.totalDeposits).minus(i.totalAmountOfInstantLoans).minus(i.totalAmountOfBespokeLoans).toFixed(0))
  });

  sdk.util.sumSingleBalance(balances, 'ethereum', (await collateral()) / 1e18)
  return balances;
}

async function borrowed(timestamp, block, chainBlocks) {
  const balances = {};
  const { reserves } = await request(graphUrl, graphReservesQuery);

  reserves.forEach(i => {
    sdk.util.sumSingleBalance(balances, i.underlyingAsset, BigNumber(i.totalAmountOfInstantLoans).plus(i.totalAmountOfBespokeLoans).toFixed(0))
  });

  return balances;
}

async function getFloorPrice(address) {
  const url = `https://api.nftbank.ai/estimates-v2/floor_price/${address}?chain_id=ETHEREUM`
  const { data } = await axios.get(url,
    {
      headers: {
        'x-api-key': '70c3d2af9df9a83f2b64b055484347ee'
      },
      retries: 3
    }
  )
  return data.data[0].floor_price.filter(item => item.currency_symbol == 'ETH')[0].floor_price
}

async function collateral() {
  let { collections } = await request(
    graphUrl,
    graphCollectionsQuery,
    { limit: 100 }
  );

  collections = collections.filter(collection => 
    collection.numberOfBespokeLoans > 0 || collection.numberOfInstantLoans > 0
  );

  const floorPrices = await Promise.all(
    collections.map(collection =>
      getFloorPrice(collection.id)
    )
  );

  let collateralValue = new BigNumber(0);

  collections.forEach((collection, index) => {
    collateralValue = collateralValue.plus(
      new BigNumber(
        parseEther(
          floorPrices[index] * (parseInt(collection.numberOfBespokeLoans) + parseInt(collection.numberOfInstantLoans)) + ''
        ).toString()
      )
    )
  });

  return collateralValue.toString();
}

module.exports = {
  timetravel: false,
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
  ethereum: {
    tvl,
    borrowed,
  },
}