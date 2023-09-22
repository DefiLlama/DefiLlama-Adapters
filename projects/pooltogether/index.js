const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const abi = require('./abi.json')
const { getChainTransform } = require("../helper/portedTokens");
const { getBlock } = require("../helper/http");
const { sumTokens } = require("../helper/unwrapLPs");
const { default: BigNumber } = require("bignumber.js");

const graphUrls = ['https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_1_0',
  'https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_3_2',
  'https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_3_8',
  'https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_4_3']
const celoGraphUrl = 'https://api.thegraph.com/subgraphs/name/pooltogether/celo-v3_4_5'
const bscGraphUrl = 'https://api.thegraph.com/subgraphs/name/pooltogether/bsc-v3_4_3'

const graphQuery = gql`
query GET_POOLS($block: Int) {
  prizePools{
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
  ],
  avax:[
    ['0x46a51127c3ce23fb7ab1de06226147f446e4a857', '0x7437db21A0dEB844Fa64223e2d6Db569De9648Ff']
  ],
  optimism:[
    ['0x625E7708f30cA75bfd92586e17077590C60eb4cD', '0x4ecB5300D9ec6BCA09d66bfd8Dcb532e3192dDA1']
  ]
}

async function getChainBalances(allPrizePools, chain, block, transform) {
  const balances = {};
  transform = transform || (addr=>`${chain}:${addr}`);
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
    sdk.util.sumSingleBalance(balances, underlyingToken, BigNumber(underlyingTokenBalance).toFixed(0))
  })
  if(v4pools[chain]!== undefined){
    await sumTokens(balances, v4pools[chain], block, chain, transform)
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
    underlyingCollateralToken: ADDRESSES.ethereum.USDT
  },
  {
    id: "0xee06abe9e2af61cabcb13170e01266af2defa946",
    underlyingCollateralToken: ADDRESSES.ethereum.USDC
  }], 'polygon', chainBlocks.polygon)
}

async function avax(timestamp, block, chainBlocks) {
  return getChainBalances([], 'avax', chainBlocks.avax, ()=>`avax:0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664`)
}

async function optimism(timestamp, block, chainBlocks) {
  return getChainBalances([], 'optimism', chainBlocks.optimism, ()=>`optimism:0x7F5c764cBc14f9669B88837ca1490cCa17c31607`)
}

async function celo(timestamp, block, chainBlocks) {
  const transform = await getChainTransform('celo')
  let allPrizePools = []
  block = chainBlocks.celo
  const { prizePools } = await request(
    celoGraphUrl, graphQuery, { block })
  allPrizePools = allPrizePools.concat(prizePools)
  return getChainBalances(allPrizePools, 'celo', block, transform)
}

async function bsc(timestamp, _, chainBlocks) {
  const transform = await getChainTransform('bsc')
  let allPrizePools = []
  const blockG = await getBlock(timestamp, 'bsc', chainBlocks) - 1000
  const { prizePools } = await request(bscGraphUrl, graphQuery, { block: blockG })
  allPrizePools = allPrizePools.concat(prizePools)
  return getChainBalances(allPrizePools, 'bsc', chainBlocks.bsc, transform)
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: eth
  },
  polygon: {
    tvl: polygon
  },
  avax:{
    tvl: avax
  },
  optimism:{
    tvl: optimism
  },
  celo: {
    tvl: celo
  },
  bsc: {
    tvl: bsc,
  },
  hallmarks:[
    [1658872800, "OP Rewards Start"],
    [1669615200, "OP Rewards Start"],
  ],
  methodology: `TVL is the total quantity of tokens locked in PoolTogether pools on Ethereum, Polygon, Avalanche, Optimism, Celo, and BSC`
}
