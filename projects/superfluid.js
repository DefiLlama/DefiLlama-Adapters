const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const { request, gql } = require("graphql-request"); // GraphQLClient
const { transformPolygonAddress, transformXdaiAddress } = require("./helper/portedTokens");
// const abi = require('./erc20-abi.json')

// Superfluid Supertokens can be retrieved using GraphQl API - cannot use block number to retrieve historical data at the moment though
const polygonGraphUrl = 'https://api.thegraph.com/subgraphs/name/superfluid-finance/superfluid-matic'
const xdaiGraphUrl = 'https://api.thegraph.com/subgraphs/name/superfluid-finance/superfluid-xdai'
const supertokensQuery = gql`
query get_supertokens($block: Int) {
  tokens(
    first: 1000, 
    block: { number: $block } 
  ) {
    id
    underlyingAddress
    name
    symbol
  }
}
`;
// An upcoming superfluid graphql subgraph will be published soon and provide token supplies. 

// Main function for all chains to get balances of superfluid tokens
async function getChainBalances(allTokens, chain, block, transform = a => a) {
  // Init empty balances
  let balances = {};

  // Abi MultiCall to get supertokens supplies
  const lockedTokensOutput = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply', // abi['totalSupply'],
    calls: allTokens.map(token => ({
      target: token.id,
      })
    ),
    block,
    chain
  })
  //console.log(chain, lockedTokensOutput.output, allTokens)
  
  // Execute decimals ABI (future proof), otherwise could simply store decimals count in an array
  const decimals = await sdk.api.abi.multiCall({
    abi: 'erc20:decimals', // abi['decimals'],
    calls: allTokens.map(token => ({
      target: token.underlyingAddress,
      })),
    block,
    chain
  })
  decimals.output.forEach(call => {
    const tokens = allTokens.filter(token => token.underlyingAddress === call.input.target)
    let decimals = call.output
    tokens.forEach(token => {
      // Some abi calls error out, replace known decimals count 
      if (token.underlyingAddress === '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599') decimals = '8'; // WBTC
      else if (token.underlyingAddress === '0x0000000000000000000000000000000000000000') decimals = '18'; // ETH
      token.decimals = decimals
    })
  })
  // Going forward, each token of allTokens has been appended mainnetUnderlyingAddress and decimals  
  // console.log('\n\n', allTokens, '\n\n')

  // Loop one last time through abi multicalls to parse balances 
  lockedTokensOutput.output.forEach(call => {
    // Find corresponding token and retrieve mainnetUnderlyingAddress and decimals stored previously
    const token = allTokens.find(token => token.id === call.input.target)

    // Edit balance given decimal ABI multicall output and decimalCount. Note: all super tokens have 18 decimals, regardless of underlying asset, but need to adjust balance based on decimal of underlying
    let decimals = token.decimals || 18;
    let underlyingTokenBalance = BigNumber(call.output).div( 10 ** (18 - decimals) ).toFixed(0)
    
    // Accumulate to balances, the balance for tokens on mainnet or sidechain
    let prefixedUnderlyingAddress = chain + ':' + token.underlyingAddress
    if (tokensNativeToSidechain.includes(token.id)) prefixedUnderlyingAddress = chain + ':' + token.id
    sdk.util.sumSingleBalance(balances, prefixedUnderlyingAddress, underlyingTokenBalance)
    //console.log('Token:', token.symbol, '- decimals:', decimals, '- underlyingTokenBalance:', underlyingTokenBalance, '- mainnetUnderlyingAddress:', mainnetUnderlyingAddress)
  })

  return balances
}

const tokensNativeToSidechain = [
  '0x2bf2ba13735160624a0feae98f6ac8f70885ea61', // xdai FRACTION
  '0x63e62989d9eb2d37dfdb1f93a22f063635b07d51'  // xdai MIVA 
]

async function retrieveSupertokensBalances(chain, timestamp, ethBlock, chainBlocks) {
  // Retrieve supertokens from graphql API
  let graphUrl, block, transform;
  if (chain === 'polygon') {
    graphUrl = polygonGraphUrl
    block = chainBlocks.polygon
    transform = await transformPolygonAddress()
  }
  else if (chain === 'xdai') {
    graphUrl = xdaiGraphUrl
    block = chainBlocks.xdai
    transform = await transformXdaiAddress()
  }

  const { tokens } = await request(
    graphUrl, 
    supertokensQuery, 
    {block}
  )

  const allTokens = tokens.filter(t => t.symbol.length > 0)

  return getChainBalances(allTokens, chain, block, transform)
}
async function polygon(timestamp, block, chainBlocks) {
  return retrieveSupertokensBalances('polygon', timestamp, block, chainBlocks)
}

async function xdai(timestamp, block, chainBlocks) {
  return retrieveSupertokensBalances('xdai', timestamp, block, chainBlocks)
}


module.exports = {
  polygon: {
    tvl: polygon
  }, 
  xdai: {
    tvl: xdai
  },
  methodology: `TVL is the total quantity of tokens locked in Super Tokens from Superfluid, on Polygon and xDai (most important being weth, dai, usdc and wbtc, as well as QiDAO and MOCA)`
}
