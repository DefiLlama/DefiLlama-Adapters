const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')
const { blockQuery } = require("../helper/http");

const graphUrls = {
  ethereum: sdk.graph.modifyEndpoint('6Kf5cPeXUMVzfGCtzBnSxDU849w2YM2o9afn1uiPpy2m'),
  polygon: sdk.graph.modifyEndpoint('5F3eB4Cm5mxorArsyrbs2a1TDxctmk3znpDZ4LEzqrBJ'),
  arbitrum: sdk.graph.modifyEndpoint('G3rbmaF7w2ZLQjZgGoi12BzPeL9z4MTW662iVyjYmtiX'),
  bsc: sdk.graph.modifyEndpoint('D1TGHRKx2Q54ce2goyt9hbtKNuT94FDBsuPwtGg5EzRw'),
  avax: sdk.graph.modifyEndpoint('BHeJByyVoNuVtqufK3Nk7YYmFkBs43boYpKv8z6hQ5Q1'),
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
