const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const abi = require('./abi.json')
const { transformCeloAddress } = require("../helper/portedTokens");
const { getBlock } = require("../helper/getBlock");

const graphUrls = ['https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_1_0', 
  'https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_3_2']
const celoGraphUrl = 'https://api.thegraph.com/subgraphs/name/pooltogether/celo-v3_4_5'

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

async function getChainBalances(allPrizePools, chain, block, transform = a => a){
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
    const underlyingToken = transform(allPrizePools.find(pool => 
      pool.id === call.input.target).underlyingCollateralToken);
    const underlyingTokenBalance = ((underlyingToken.includes('0x')) ? 
      call.output : call.output / 10**18)
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
      id: "0xc32a0f9dfe2d93e8a60ba0200e033a59aec91559",
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

async function celo(timestamp, block, chainBlocks) {
  const transform = await transformCeloAddress()
  let allPrizePools = []
  block = await getBlock(timestamp, 'celo', chainBlocks)
    const { prizePools } = await request(
      celoGraphUrl, graphQuery, { block })
    allPrizePools = allPrizePools.concat(prizePools)
  return getChainBalances(allPrizePools, 'celo', block, transform)
}

module.exports = {
  ethereum:{
    tvl: eth
  },
  polygon:{
    tvl:polygon
  },
  celo:{
    tvl:celo
  },
  tvl: sdk.util.sumChainTvls([eth, polygon, celo]),
  methodology: `TVL is the total quantity of tokens locked in poolTogether pools, on Ethereum, Polygon and Celo`
}