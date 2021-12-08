const BigNumber = require('bignumber.js')
const { request, gql } = require("graphql-request");
const axios = require("axios");

const graphUrl = 'https://api2.spacefarm.xyz/api';
const tvlQuery = gql`
  {
    spaceFarm {
      totalStackTez
    }
  }
`;

async function tvl() {
    const data = (await request(graphUrl, tvlQuery));
    const totalLiquidity = new BigNumber(data.spaceFarm.totalStackTez);
    return {
      tezos: totalLiquidity
    }
}

module.exports = {
    methodology: 'TVL counts the liquidity of FlameDefi farms. Data is pulled from:"https://api2.spacefarm.xyz/api".',
    misrepresentedTokens: true,
    tvl
}