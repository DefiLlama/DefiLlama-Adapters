const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request"); // GraphQLClient
const { transformPolygonAddress, transformXdaiAddress } = require("./helper/portedTokens");
// const abi = require('./erc20-abi.json')

// Superfluid Supertokens can be retrieved using GraphQl API - cannot use block number to retrieve historical data at the moment though
const polygonGraphUrl = 'https://api.thegraph.com/subgraphs/name/superfluid-finance/superfluid-matic'
const xdaiGraphUrl = 'https://api.thegraph.com/subgraphs/name/superfluid-finance/superfluid-xdai'
const supertokensQuery = gql`
query get_supertokens {
  tokens(first: 1000) {
    id
    underlyingAddress
    name
    symbol
  }
}
`;

// Callback for lockedTokens - XDAI chain transform is async but polygon transform is sync
function lockedTokensCallback_sync(call, transform) {
  const token = allTokens.find(token => token.id === call.input.target)
  mainnetUnderlyingAddress = transform(token.underlyingAddress) 
  token.mainnetUnderlyingAddress = mainnetUnderlyingAddress
  return {
    target: mainnetUnderlyingAddress, 
    methodName: 'decimals',
    reference: 'decimals',
  }
}
async function lockedTokensCallback_async(call, transform) {
  const token = allTokens.find(token => token.id === call.input.target)
  mainnetUnderlyingAddress = await transform(token.underlyingAddress) 
  token.mainnetUnderlyingAddress = mainnetUnderlyingAddress
  return {
    target: mainnetUnderlyingAddress, 
    methodName: 'decimals',
    reference: 'decimals',
  }
}

// Main function for all chains to get balances of superfluid tokens
async function getChainBalances(allTokens, chain, block, transform = a => a) {
  // Init empty balances
  let balances = {};

  // Abi MultiCall to get supertokens supplies
  const lockedTokensOutput = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply', // abi['totalSupply'],
    calls: allTokens.map(token => ({
      target: token.id, 
      methodName: 'totalSupply',
      reference: 'totalSupply',
      })
    ),
    block,
    chain
  })

  // xdai transform needs to be wrapped in an async function, while polygon transform can be wrapped in a sync function
  // Set mainnetUnderlyingAddress in callback and outputs calls for decimals abi
  let mainnetDecimalsCalls;
  if (chain === 'xdai') mainnetDecimalsCalls = lockedTokensOutput.output.map( call => lockedTokensCallback_async(call, transform) )
  else mainnetDecimalsCalls = lockedTokensOutput.output.map( call => lockedTokensCallback_sync(call, transform) )
  
  // Execute decimals ABI (future proof), otherwise could simply store decimals count in an array
  const decimals = await sdk.api.abi.multiCall({
    abi: 'erc20:decimals', // abi['decimals'],
    calls: mainnetDecimalsCalls,
    block,
    chain: 'ethereum'
  })
  decimals.output.forEach(call => {
    const tokens = allTokens.filter(token => token.mainnetUnderlyingAddress === call.input.target)
    let decimals = call.output
    tokens.forEach(token => {
      // Some abi calls error out, replace known decimals count 
      if (token.mainnetUnderlyingAddress === '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599') decimals = '8'; // WBTC
      else if (token.mainnetUnderlyingAddress === '0x0000000000000000000000000000000000000000') decimals = '18'; // ETH
      token.decimals = decimals
    })
  })
  // Going forward, each token of allTokens has been appended mainnetUnderlyingAddress and decimals  
  // console.log('\n\n', allTokens, '\n\n')

  // Loop one last time through abi multicalls to parse balances 
  lockedTokensOutput.output.forEach(call => {
    // Find corresponding token and retrieve mainnetUnderlyingAddress and decimals stored previously
    const token = allTokens.find(token => token.id === call.input.target)
    let mainnetUnderlyingAddress = token.mainnetUnderlyingAddress;
    let decimals = token.decimals || 18;

    // Edit balance given ABI multicall output and decimalCount, and accumulate to balances
    let underlyingTokenBalance = call.output / 10 ** (18 - decimals) 
    sdk.util.sumSingleBalance(balances, mainnetUnderlyingAddress, underlyingTokenBalance)
    console.log('token.symbol', token.symbol, 'mainnetUnderlyingAddress', mainnetUnderlyingAddress, 'underlyingTokenBalance', underlyingTokenBalance, 'decimals', decimals, 'balances')
  })

  // Remove null balances
  balances = Object.assign({}, ...
    Object.entries(balances).filter(([k,v]) => v > 0).map(([k,v]) => ({[k]:v}))
  );
  return balances
}

const selectedTokens = ['USDCx', 'ETHx', 'DAIx', 'WBTCx', 'USDTx', 'SDTx', 'QIx', 'MOCAx']

async function retrieveSupertokensBalances(chain, timestamp, block, chainBlocks) {
  // Retrieve supertokens from graphql API
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

  const { tokens } = await request(graphUrl, supertokensQuery)

  // Filter out some tokens for easier debugging
  //allTokens = tokens.filter(t => selectedTokens.includes(t.symbol)) 
  allTokens = tokens.filter(t => t.symbol.length > 0)
  // console.log(allTokens)

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
  tvl: sdk.util.sumChainTvls([xdai, polygon]),
  
  //tvl: xdai,
  methodology: `TVL is the total quantity of tokens locked in Super Tokens from Superfluid, on Polygon and xDai (most important being weth, dai, usdc and wbtc, as well as QiDAO and MOCA)`
}

