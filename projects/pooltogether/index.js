const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const abi = require('./abi.json')
const { transformCeloAddress, transformBscAddress } = require("../helper/portedTokens");
const { getBlock } = require("../helper/getBlock");
const { sumTokens } = require("../helper/unwrapLPs");

const graphUrls = ['https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_1_0',
  'https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_3_2',
  'https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_3_8',
  'https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_4_3']
const celoGraphUrl = 'https://api.thegraph.com/subgraphs/name/pooltogether/celo-v3_4_5'
const bscGraphUrl = 'https://api.thegraph.com/subgraphs/name/pooltogether/bsc-v3_4_3'

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

const v4pools={
  ethereum:[
    ["0xbcca60bb61934080951369a648fb03df4f96263c", "0x32e8d4c9d1b711bc958d0ce8d14b41f77bb03a64"]
  ],
  polygon:[
    ["0x1a13f4ca1d028320a707d99520abfefca3998b7f", "0xD4F6d570133401079D213EcF4A14FA0B4bfB5b9C"]
  ]
}

async function getChainBalances(allPrizePools, chain, block, transform = a => a) {
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
      call.output : call.output / 10 ** 18)
    sdk.util.sumSingleBalance(balances, underlyingToken, underlyingTokenBalance)
  })
  if(v4pools[chain]!== undefined){
    await sumTokens(balances, v4pools[chain], block, chain, addr=>`${chain}:${addr}`)
  }
  return balances
}

async function eth(timestamp, block) {
  let allPrizePools = []
  let combinedPrizePools = []
  for (const graphUrl of graphUrls) {
    const { prizePools } = await request(
      graphUrl,
      graphQuery,
      {
        block,
      }
    );
    allPrizePools = allPrizePools.concat(prizePools)
  }
  combinedPrizePools = allPrizePools.flat()
  allPrizePools = [...new Set(combinedPrizePools.map(a => JSON.stringify(a)))].map(a => JSON.parse(a))
  return getChainBalances(allPrizePools, 'ethereum', block, addr=>{
    if(addr === "0x04f2694c8fcee23e8fd0dfea1d4f5bb8c352111f") return "0x383518188c0c6d7730d91b2c03a03c837814a899" // OHM
    return addr
  })
}

async function polygon(timestamp, block, chainBlocks) {
  return getChainBalances([{
    id: "0x887E17D791Dcb44BfdDa3023D26F7a04Ca9C7EF4",
    underlyingCollateralToken: "0xdac17f958d2ee523a2206206994597c13d831ec7"
  },
  {
    id: "0xee06abe9e2af61cabcb13170e01266af2defa946",
    underlyingCollateralToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
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

async function bsc(timestamp, block, chainBlocks) {
  const transform = await transformBscAddress()
  let allPrizePools = []
  block = await getBlock(timestamp, 'bsc', chainBlocks) - 1000
  const { prizePools } = await request(
    bscGraphUrl, graphQuery, { block })
  allPrizePools = allPrizePools.concat(prizePools)
  return getChainBalances(allPrizePools, 'bsc', block, transform)
}

module.exports = {
  ethereum: {
    tvl: eth
  },
  polygon: {
    tvl: polygon
  },
  celo: {
    tvl: celo
  },
  bsc: {
    tvl: bsc
  },
  methodology: `TVL is the total quantity of tokens locked in poolTogether pools, on Ethereum, Polygon, Celo, and BSC`
}