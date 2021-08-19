/*==================================================
  Modules
  ==================================================*/
  const { request, gql } = require("graphql-request");
  const BigNumber = require('bignumber.js');
  const sdk = require("@defillama/sdk")

  const GRAPH_URL = 'https://api.thegraph.com/subgraphs/name/sirenmarkets/protocol';

/*==================================================
  TVL
  ==================================================*/

  async function tvl(timestamp, block) {
    const {
      amms,
    } = await request(GRAPH_URL, GET_POOLS, {
      block,
    });

    const result = {
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': '0'
    };

    for (let i = 0; i < amms.length; i++) {
      const amm = amms[i];
      const collateralToken = amm['collateralToken']['id'];

      // Get collateral in AMM
      const response = await sdk.api.erc20.balanceOf({
        block,
        target: collateralToken,
        owner: amm['id'],
      });

      if (!result[collateralToken]) {
        result[collateralToken] = '0';
      }
      result[collateralToken] = BigNumber(result[collateralToken]).plus(response.output).toFixed();

      // Get collateral in Markets
      for (let im = 0; im < amm.markets.length; im++) {
        const market = amm.markets[im];

        const response = await sdk.api.erc20.balanceOf({
          block,
          target: collateralToken,
          owner: market['id'],
        });

        result[collateralToken] = BigNumber(result[collateralToken]).plus(response.output).toFixed();
      }
    }

    return result;
  }

  const GET_POOLS = gql`
    query Pools($block: Int) {
      amms(block: { number: $block }) {
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

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'Siren',
    token: 'SI',
    category: 'derivatives',
    start: 1605574800, // Nov-17-2020 01:00:00 AM +UTC
    tvl
  }