const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const { request, gql } = require("graphql-request"); // GraphQLClient

// Superfluid Supertokens can be retrieved using GraphQl API - cannot use block number to retrieve historical data at the moment though
// TheGraph URL before being deprecated, before 2021-12-23
// const polygonGraphUrl = 'https://api.thegraph.com/subgraphs/name/superfluid-finance/superfluid-matic'
// const xdaiGraphUrl = 'https://api.thegraph.com/subgraphs/name/superfluid-finance/superfluid-xdai'
const polygonGraphUrl = 'https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-matic'
const xdaiGraphUrl = 'https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-xdai'

const supertokensQuery = gql`
query get_supertokens($block: Int) {
  tokens(
    first: 1000, 
    block: { number: $block } 
    where:{
     isSuperToken:true
   }
  ) {
    id
    underlyingAddress
    name
    underlyingToken {
      name
      decimals
      id
    }
    symbol
    decimals
    isSuperToken
    isNativeAssetSuperToken
    isListed
  }
}
`;
// An upcoming superfluid graphql subgraph will be published soon and provide token supplies. 

// Main function for all chains to get balances of superfluid tokens
async function getChainBalances(allTokens, chain, block) {
  // Init empty balances
  let balances = {};

  // Abi MultiCall to get supertokens supplies
  const { output: supply } = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply', // abi['totalSupply'],
    calls: allTokens.map(token => ({
      target: token.id,
    })
    ),
    block,
    chain
  })

  supply.forEach(({ output: totalSupply }, i) => {
    const {
      id,
      underlyingAddress,
      underlyingToken,
      decimals,
      name, 
      symbol,
      isNativeAssetSuperToken,
    } = allTokens[i]
    let underlyingTokenBalance = BigNumber(totalSupply * (10 ** (underlyingToken || { decimals: 18 }).decimals) / (10 ** decimals)).toFixed(0)
    // Accumulate to balances, the balance for tokens on mainnet or sidechain
    let prefixedUnderlyingAddress = chain + ':' + underlyingAddress
    // if (!underlyingToken && underlyingTokenBalance/1e24 > 1) console.log(name, symbol, chain, Math.floor(underlyingTokenBalance/1e24))
    if (isNativeAssetSuperToken || tokensNativeToSidechain.includes(id.toLowerCase())) prefixedUnderlyingAddress = chain + ':' + id
    else if (!underlyingToken) return;
    sdk.util.sumSingleBalance(balances, prefixedUnderlyingAddress, underlyingTokenBalance)
  })
  //console.log(chain, lockedTokensOutput.output, allTokens)

  return balances
}

const tokensNativeToSidechain = [
  '0x2bf2ba13735160624a0feae98f6ac8f70885ea61', // xdai FRACTION
  '0x63e62989d9eb2d37dfdb1f93a22f063635b07d51', // xdai MIVA 
  '0x263026e7e53dbfdce5ae55ade22493f828922965', // polygon RIC
]

async function retrieveSupertokensBalances(chain, timestamp, ethBlock, chainBlocks) {
  // Retrieve supertokens from graphql API
  let graphUrl, block;
  if (chain === 'polygon') {
    graphUrl = polygonGraphUrl
    block = chainBlocks.polygon
  }
  else if (chain === 'xdai') {
    graphUrl = xdaiGraphUrl
    block = chainBlocks.xdai
  }

  const { tokens } = await request(
    graphUrl,
    supertokensQuery,
    { block }
  )

  const allTokens = tokens.filter(t => t.isSuperToken)

  return getChainBalances(allTokens, chain, block)
}
async function polygon(timestamp, block, chainBlocks) {
  return retrieveSupertokensBalances('polygon', timestamp, block, chainBlocks)
}

async function xdai(timestamp, block, chainBlocks) {
  return retrieveSupertokensBalances('xdai', timestamp, block, chainBlocks)
}


module.exports = {
  hallmarks: [
    [1644278400, "Fake ctx hack"]
  ],
  polygon: {
    tvl: polygon
  },
  xdai: {
    tvl: xdai
  },
  methodology: `TVL is the total quantity of tokens locked in Super Tokens from Superfluid, on Polygon and xDai (most important being weth, dai, usdc and wbtc, as well as QiDAO and MOCA)`
}
