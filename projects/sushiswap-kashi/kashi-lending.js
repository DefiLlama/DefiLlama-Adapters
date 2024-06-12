const ADDRESSES = require('../helper/coreAssets.json')
const { blockQuery } = require("../helper/http");

const graphUrls = {
  ethereum: "https://api.thegraph.com/subgraphs/name/sushi-labs/kashi-ethereum",
  polygon: "https://api.thegraph.com/subgraphs/name/sushi-labs/kashi-polygon",
  arbitrum: "https://api.thegraph.com/subgraphs/name/sushi-labs/kashi-arbitrum",
  bsc: "https://api.thegraph.com/subgraphs/name/sushi-labs/kashi-bsc",
  avax: "https://api.thegraph.com/subgraphs/name/sushiswap/kashi-avalanche",
};

const bentoboxes = {
  ethereum: "0xF5BCE5077908a1b7370B9ae04AdC565EBd643966",
  polygon: "0x0319000133d3AdA02600f0875d2cf03D442C3367",
  arbitrum: "0x74c764D41B77DBbb4fe771daB1939B00b146894A",
  bsc: "0xF5BCE5077908a1b7370B9ae04AdC565EBd643966",
  avax: "0x0711b6026068f736bae6b213031fce978d48e026",
};

const toAmountAbi = 'function toAmount(address token, uint256 share, bool roundUp) view returns (uint256 amount)'

const kashiQuery = `
  query get_pairs($block: Int) {
    kashiPairs(block: { number: $block }, first: 1000) {
      id
      asset {
        id
      }
      collateral {
        id
      }
      totalAsset {
        elastic
      }
      totalBorrow {
        elastic
      }
      totalCollateralShare
    }
  }
`;

function kashiLending(chain, borrowed) {
  return async (api) => {
    const graphUrl = graphUrls[chain];

    // Query graphql endpoint
    const { kashiPairs } = await blockQuery(graphUrl, kashiQuery, {
      api
    });
    const calls = []

    kashiPairs.map(async (pair) => {
      if (
        pair.asset.id === ADDRESSES.null ||
        pair.collateral.id === ADDRESSES.null
      ) {
        return;
      }
      if (borrowed) {
        if (+pair.totalBorrow.elastic <= 0) {
          return;
        }
        //count tokens borrowed
        const shares = pair.totalBorrow.elastic;
        //convert shares to amount
        calls.push({ params: [pair.asset.id, shares, false] })
      } else {
        if (+pair.totalAsset.elastic <= 0) {
          return;
        }
        //count tokens not borrowed + collateral
        const assetShares = pair.totalAsset.elastic;
        const collateralShares = pair.totalCollateralShare;
        calls.push({ params: [pair.asset.id, assetShares, false] })
        calls.push({ params: [pair.collateral.id, collateralShares, false] })
      }
    })

    const output = await api.multiCall({
      calls, abi: toAmountAbi, target: bentoboxes[chain],
    })

    output.forEach((balance, idx) => {
      api.add(calls[idx].params[0], balance)
    })
  };
}

module.exports = {
  kashiLending,
  methodology: `TVL of Kashi lending consists of the tokens available to borrow and the ones used as collateral, tokens borrowed are not counted to avoid inflating TVL through cycled lending.`,
};
