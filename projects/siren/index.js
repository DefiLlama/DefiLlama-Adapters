/*==================================================
  Modules
  ==================================================*/
  const { request, gql } = require("graphql-request");
  const BigNumber = require('bignumber.js');
  const sdk = require("@defillama/sdk");

  const MAINNET_GRAPH_URL = 'https://api.thegraph.com/subgraphs/name/sirenmarkets/protocol';

  const POLYGON_GRAPH_URL = 'https://api.thegraph.com/subgraphs/name/sirenmarkets/protocol-v2-matic'

  const POLYGON_SERIES_ADDRESS = '0x716c543b39a85aac0240ba7ed07e79f06e1fed48'

/*==================================================
  TVL
  ==================================================*/
async function calculateMainnetTVL(timestamp, block, chainBlocks) { 

  const ethereumBlock = chainBlocks['ethereum'];

  const mainnet_amms = await request(MAINNET_GRAPH_URL, GET_POOLS_MAINNET, {
    ethereumBlock,
  });

  const mainnet_result = {
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': '0'
  };

      for (let i = 0; i < mainnet_amms['amms'].length; i++) {

      const amm = mainnet_amms['amms'][i];

      const collateralToken = amm['collateralToken']['id'];

      // Get collateral in AMM
      const response = await sdk.api.erc20.balanceOf({
        block: ethereumBlock,
        target: collateralToken,
        owner: amm['id'],
        chain: "ethereum"
      });

      if (!mainnet_result[collateralToken]) {
        mainnet_result[collateralToken] = '0';
      }
      mainnet_result[collateralToken] = BigNumber(mainnet_result[collateralToken]).plus(response.output).toFixed();

      // Get collateral in Markets
      for (let im = 0; im < amm.markets.length; im++) {
        const market = amm.markets[im];

        const response = await sdk.api.erc20.balanceOf({
          block: ethereumBlock,
          target: collateralToken,
          owner: market['id'],
          chain: "ethereum"
        });

        mainnet_result[collateralToken] = BigNumber(mainnet_result[collateralToken]).plus(response.output).toFixed();
      }
    }
    return mainnet_result;

}

async function calculatePolygonTVL(timestamp, block, chainBlocks) { 

  const polygonBlock = chainBlocks['polygon'];

  const polygon_amms = await request(POLYGON_GRAPH_URL, GET_POOLS_POLYGON, {
    polygonBlock,
  });

  const polygon_result = {
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': '0'
  };

  for (let i = 0; i < polygon_amms['amms'].length; i++) {
    const amm = polygon_amms['amms'][i];
    const collateralToken = amm['collateralToken']['id'];

    // Get collateral in AMM
    const response = await sdk.api.erc20.balanceOf({
        block: polygonBlock,
        target: collateralToken,
        owner: amm['id'],
        chain: "polygon"
      });
    

    if (!polygon_result['polygon:'+collateralToken]) {
      polygon_result['polygon:'+collateralToken] = '0';
    }
    polygon_result['polygon:'+collateralToken] = BigNumber(polygon_result['polygon:'+collateralToken]).plus(response.output).toFixed();

    // Get collateral in Series
    for (let im = 0; im < amm.series.length; im++) {

      const response = await sdk.api.erc20.balanceOf({
          block: polygonBlock,
          target: collateralToken,
          owner: POLYGON_SERIES_ADDRESS,
          chain: "polygon"
        });

      polygon_result['polygon:'+collateralToken] = BigNumber(polygon_result['polygon:'+collateralToken]).plus(response.output).toFixed();
    }
  }
  return polygon_result;

}

  const GET_POOLS_MAINNET = gql`
    query Pools($ethereumBlock: Int) {
      amms(block: { number: $ethereumBlock }) {
        id
        collateralToken {
          id
        }
        markets {
          id
        }
      }
    }
  `

const GET_POOLS_POLYGON = gql`
query Pools($polygonBlock: Int) {
  amms(block: { number: $polygonBlock }) {
    id
    collateralToken {
      id
    }
    series{
        	id,
          series{
            id,
            seriesId
          }
        }
  }
}
`

// async function calculateUniTvl()

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'Siren',
    token: 'SI',
    category: 'derivatives',
    start: 1605574800, // Nov-17-2020 01:00:00 AM +UTC
    polygon: {
      tvl: calculatePolygonTVL,
    },
    ethereum: { 
      tvl: calculateMainnetTVL
    },
    tvl: sdk.util.sumChainTvls([calculatePolygonTVL, calculateMainnetTVL]),
  }