const { GraphQLClient, gql } = require("graphql-request");
const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");

const graphUri = "https://api.studio.thegraph.com/query/42478/blast_mainnet/version/latest";

async function allPools(graphUri) {
  var graphQLClient = new GraphQLClient(graphUri);
  const query = gql`
      {
          pools{
              id
              tradePool
              token0{
                  id
                  decimals
              }
              token1{
                  id
                  decimals
              }
          }
      }
  `;
  let res = await graphQLClient.request(query);
  return res;
}

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  const graphRs = await allPools(graphUri);

  for (let i = 0; i < graphRs.pools.length; i++) {
    const pool = graphRs.pools[i];
    const spotPoolAddress = pool.id;
    const tradePoolAddress = pool.tradePool;
    const token0Address = pool.token0.id;
    const token1Address = pool.token1.id;


    const addBalance = (tokenAddress, amount) => {
      const fantomTokenAddress = `blast:${tokenAddress}`;
      const existingBalance = balances[fantomTokenAddress];
      if (existingBalance) {
        balances[fantomTokenAddress] = new BigNumber(existingBalance).plus(amount).toFixed(0);
      } else {
        balances[fantomTokenAddress] = amount;
      }
    };

    const { output: spotToken0Bal } = await sdk.api.abi.call({
      chain: "blast",
      target: token0Address,
      params: spotPoolAddress,
      abi: "erc20:balanceOf"
    });
    addBalance(token0Address, spotToken0Bal);

    const { output: spotToken1Bal } = await sdk.api.abi.call({
      chain: "blast",
      target: token1Address,
      params: spotPoolAddress,
      abi: "erc20:balanceOf"
    });
    addBalance(token1Address, spotToken1Bal);

    const { output: prepToken0Bal } = await sdk.api.abi.call({
      chain: "blast",
      target: token0Address,
      params: tradePoolAddress,
      abi: "erc20:balanceOf"
    });
    addBalance(token0Address, prepToken0Bal);

    const { output: prepToken1Bal } = await sdk.api.abi.call({
      chain: "blast",
      target: token0Address,
      params: tradePoolAddress,
      abi: "erc20:balanceOf"
    });
    addBalance(token0Address, prepToken1Bal);
  }

  return balances;
}

// allPools(graphUri);
module.exports = {
  blast: {
    tvl
  }
};


