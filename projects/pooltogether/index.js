const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const abi = require('./abi.json')

const graphUrls = ['https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_1_0', 'https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_3_2']
const graphQuery = gql`
query GET_POOLS($block: Int) {
  prizePools(
    block: { number: $block }
  ) {
    id
    underlyingCollateralSymbol
    underlyingCollateralToken
    compoundPrizePool{
      cToken
    }
  }
}
`;

async function getChainBalances(allPrizePools, chain, block){
  const balances = {};
  const lockedTokens = await sdk.api.abi.multiCall({
    abi: abi['accountedBalance'],
    calls: allPrizePools.map(pool => ({
      target: pool.id
    })),
    block,
    chain
  })
  lockedTokens.output.forEach(call => {
    const underlyingToken = allPrizePools.find(pool => pool.id === call.input.target).underlyingCollateralToken;
    const underlyingTokenBalance = call.output
    sdk.util.sumSingleBalance(balances, underlyingToken, underlyingTokenBalance)
  })
  return balances
}

async function eth(timestamp, block) {
  let allPrizePools = []
  for (const graphUrl of graphUrls) {
    const { prizePools } = await request(
      graphUrl,
      graphQuery,
      {
        block,
      }
    );
    allPrizePools = allPrizePools.concat(prizePools).concat([{
      id: "0x6FE3103A51196687b464A09287d2A3dCc674CB67",
      underlyingCollateralToken: "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2"
    }])
  }
  return getChainBalances(allPrizePools, 'ethereum', block)
}

async function polygon(timestamp, block, chainBlocks) {
  return getChainBalances([{
    id: "0x887E17D791Dcb44BfdDa3023D26F7a04Ca9C7EF4",
    underlyingCollateralToken: "0xdac17f958d2ee523a2206206994597c13d831ec7"
  }], 'polygon', chainBlocks.polygon)
}


module.exports = {
  ethereum:{
    tvl: eth
  },
  polygon:{
    tvl:polygon
  },
  tvl: sdk.util.sumChainTvls([eth, polygon])
}