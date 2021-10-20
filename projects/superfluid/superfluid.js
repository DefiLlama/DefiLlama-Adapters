const sdk = require("@defillama/sdk");
const { GraphQLClient, request, gql } = require("graphql-request");
const abi = require('./erc20-abi.json')
const { getBlock } = require("../helper/getBlock");
const { transformPolygonAddress, transformXdaiAddress } = require("../helper/portedTokens");

// Superfluid Supertokens can be retrieved using GraphQl API
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

// callback for lockedTokens
function lockedTokensCallback_sync(call, transform) {
  const token = allTokens.find(token => token.id === call.input.target)
  mainnetUnderlyingAddress = transform(token.underlyingAddress) // For XDAI chain, need an async but not for polygon
  token.mainnetUnderlyingAddress = mainnetUnderlyingAddress
  return {
    target: mainnetUnderlyingAddress, 
    methodName: 'decimals',
    reference: 'decimals',
  }
}
async function lockedTokensCallback_async(call, transform) {
  const token = allTokens.find(token => token.id === call.input.target)
  mainnetUnderlyingAddress = await transform(token.underlyingAddress) // For XDAI chain, need an async but not for polygon
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
    abi: abi['totalSupply'],
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
  
  // Execute decimals ABI (future proof), otherwise could simply store them in a variable
  const decimals = await sdk.api.abi.multiCall({
    abi: abi['decimals'],
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

async function polygon(timestamp, block, chainBlocks) {
  // Retrieve supertokens from graphql API
  const { tokens } = await request(polygonGraphUrl, supertokensQuery)

  // Filter out some tokens for easier debugging
  allTokens = tokens.filter(t => selectedTokens.includes(t.symbol)) 
  allTokens = tokens.filter(t => t.symbol.length > 0)
  // console.log(allTokens)

  return getChainBalances(allTokens, 'polygon', chainBlocks.polygon, await transformPolygonAddress())
}

async function xdai(timestamp, block, chainBlocks) {
  // Retrieve supertokens from graphql API
  const { tokens } = await request(xdaiGraphUrl, supertokensQuery)

  // Filter out some tokens for easier debugging
  allTokens = tokens.filter(t => selectedTokens.includes(t.symbol)) 
  allTokens = tokens.filter(t => t.symbol.length > 0)
  // console.log(allTokens)

  transform = await transformXdaiAddress()
  return getChainBalances(allTokens, 'xdai', chainBlocks.xdai, transform)
}


module.exports = {
  /*
  polygon: {
    tvl: polygon
  }, 
  xdai: {
    tvl: xdai
  },*/
  tvl: sdk.util.sumChainTvls([polygon, polygon]),
  
  //tvl: xdai,
  methodology: `TVL is the total quantity of tokens locked in Super Tokens from Superfluid, on Polygon and xDai (most important being weth, dai, usdc and wbtc, as well as QiDAO and MOCA)`
}





// Polygon address to Mainnet address could be stored in this script instead
decimalCoeff = {
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 6, // USDC 
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 8, // WBTC
  '0x6b175474e89094c44da98b954eedeac495271d0f': 18 // DAI
}
transform_jo = addr => {
  if(addr === "0x2791bca1f2de4661ed88a30c99a7a9449aa84174") return "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" // USDC
  if(addr === "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063") return "0x6b175474e89094c44da98b954eedeac495271d0f" // DAI
  if(addr === "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619") return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" // WETH
  if(addr === "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6") return "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599" // WBTC
  return addr
}

