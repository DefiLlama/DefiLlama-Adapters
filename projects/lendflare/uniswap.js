const sdk = require('@defillama/sdk');
const BN = require("bignumber.js");
const { GraphQLClient, gql } = require("graphql-request");
const { toUSDTBalances } = require('./utils.js');

const query = gql`
  query get_tvl($pair: String) {
    pair(id: $pair) {
        reserveETH
        reserveUSD
        totalSupply
        reserveUSD
        token1Price
        volumeToken0
        volumeToken1
        volumeUSD
        untrackedVolumeUSD
        txCount
        createdAtTimestamp
        createdAtBlockNumber
    }
  }
`;

async function tvl() {
    // https://etherscan.io/address/0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f#readContract
    const lftPair = `0x9c84f58bb51fabd18698efe95f5bab4f33e96e8f`;
    const tokens = [`0xb620be8a1949aa9532e6a3510132864ef9bc3f82`, `0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2`]

    const graphQLClient = new GraphQLClient('https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2');

    const output = await graphQLClient.request(query, {
        pair: lftPair,
    });

    // console.log(`reserveETH ${output.pair.reserveETH}`);
    // console.log(`reserveUSD ${output.pair.reserveUSD}`);
    // console.log(`volumeUSD ${output.pair.volumeUSD}`);

    const reserveUSD = new BN(output.pair.reserveUSD);

    return toUSDTBalances(reserveUSD);
}

module.exports = {
    tvl
};
