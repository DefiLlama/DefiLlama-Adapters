const { getChainTransform } = require('../helper/portedTokens')
const { default: BigNumber } = require('bignumber.js')
const { request, gql } = require('graphql-request')
const { getBlock } = require('../helper/http')
const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

const GRAPH_URLS = {
  eth: [
    'https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_1_0',
    'https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_3_2',
    'https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_3_8',
    'https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_4_3'
  ],
  celo: ['https://api.thegraph.com/subgraphs/name/pooltogether/celo-v3_4_5'],
  bsc: ['https://api.thegraph.com/subgraphs/name/pooltogether/bsc-v3_4_3']
}
const GRAPH_QUERY = gql`
  query GET_POOLS($block: Int) {
    prizePools {
      id
      underlyingCollateralSymbol
      underlyingCollateralToken
      compoundPrizePool {
        cToken
      }
    }
  }
`

async function getChainBalances(allPrizePools, chain, block, transform) {
  const balances = {}

  transform = transform || ((addr) => `${chain}:${addr}`)

  const lockedTokens = await sdk.api.abi.multiCall({
    abi: abi['accountedBalance'],
    calls: allPrizePools.map((pool) => ({
      target: pool.id
    })),
    block,
    chain
  })

  lockedTokens.output.forEach((call) => {
    const underlyingToken = transform(
      allPrizePools.find((pool) => pool.id === call.input.target).underlyingCollateralToken
    )
    const underlyingTokenBalance = underlyingToken.includes('0x')
      ? call.output
      : call.output / 10 ** 18
    sdk.util.sumSingleBalance(
      balances,
      underlyingToken,
      BigNumber(underlyingTokenBalance).toFixed(0)
    )
  })

  return balances
}

async function ethereum(timestamp, block) {
  let allPrizePools = []
  let combinedPrizePools = []

  for (const graphUrl of GRAPH_URLS['eth']) {
    const { prizePools } = await request(graphUrl, GRAPH_QUERY, {
      block
    })
    allPrizePools = allPrizePools.concat(prizePools)
  }

  combinedPrizePools = allPrizePools.flat()
  allPrizePools = [...new Set(combinedPrizePools.map((a) => JSON.stringify(a)))].map((a) =>
    JSON.parse(a)
  )

  return getChainBalances(allPrizePools, 'ethereum', block, (addr) => {
    if (addr === '0x04f2694c8fcee23e8fd0dfea1d4f5bb8c352111f')
      return '0x383518188c0c6d7730d91b2c03a03c837814a899' // OHM
    return addr
  })
}

async function polygon(timestamp, block, chainBlocks) {
  return getChainBalances(
    [
      {
        id: '0x887E17D791Dcb44BfdDa3023D26F7a04Ca9C7EF4',
        underlyingCollateralToken: ADDRESSES.ethereum.USDT
      },
      {
        id: '0xee06abe9e2af61cabcb13170e01266af2defa946',
        underlyingCollateralToken: ADDRESSES.ethereum.USDC
      }
    ],
    'polygon',
    chainBlocks.polygon
  )
}

async function celo(timestamp, block, chainBlocks) {
  const transform = await getChainTransform('celo')
  let allPrizePools = []

  block = chainBlocks.celo

  const { prizePools } = await request(GRAPH_URLS['celo'], GRAPH_QUERY, { block })
  allPrizePools = allPrizePools.concat(prizePools)

  return getChainBalances(allPrizePools, 'celo', block, transform)
}

async function bsc(timestamp, _, chainBlocks) {
  const transform = await getChainTransform('bsc')
  let allPrizePools = []

  const blockG = (await getBlock(timestamp, 'bsc', chainBlocks)) - 1000

  const { prizePools } = await request(GRAPH_URLS['bsc'], GRAPH_QUERY, { block: blockG })
  allPrizePools = allPrizePools.concat(prizePools)

  return getChainBalances(allPrizePools, 'bsc', chainBlocks.bsc, transform)
}

module.exports = {
  ethereum,
  polygon,
  celo,
  bsc
}
