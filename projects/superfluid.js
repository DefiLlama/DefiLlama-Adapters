const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const { request, } = require("graphql-request"); // GraphQLClient
const { isStableToken } = require('./helper/streamingHelper')
const { getBlock } = require('./helper/http')
const { transformBalances } = require('./helper/portedTokens')

// Superfluid Supertokens can be retrieved using GraphQl API - cannot use block number to retrieve historical data at the moment though
// TheGraph URL before being deprecated, before 2021-12-23
// const polygonGraphUrl = 'https://api.thegraph.com/subgraphs/name/superfluid-finance/superfluid-matic'
// const xdaiGraphUrl = 'https://api.thegraph.com/subgraphs/name/superfluid-finance/superfluid-xdai'

const supertokensQuery = `
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
      symbol
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

function isWhitelistedToken(token, address, isVesting) {
  const isStable = isStableToken(token?.symbol, address) && !tokensNativeToSidechain.includes(address.toLowerCase())
  return isVesting ? !isStable : isStable
}

const blacklist = new Set(['0x441bb79f2da0daf457bad3d401edb68535fb3faa'].map(i => i.toLowerCase()))

// Main function for all chains to get balances of superfluid tokens
async function getChainBalances(allTokens, chain, block, isVesting) {
  // Init empty balances
  let balances = {};

  allTokens = allTokens.filter(({ underlyingAddress, underlyingToken = {}, }) => isWhitelistedToken(underlyingToken, underlyingAddress, isVesting))

  // Abi MultiCall to get supertokens supplies
  const { output: supply } = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply', // abi['totalSupply'],
    calls: allTokens.map(token => ({
      target: token.id,
    })
    ),
    block, chain
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
    let prefixedUnderlyingAddress = underlyingAddress
    // if (!underlyingToken && underlyingTokenBalance/1e24 > 1) sdk.log(name, symbol, chain, Math.floor(underlyingTokenBalance/1e24))
    // if (isNativeAssetSuperToken) prefixedUnderlyingAddress = chain + ':' + underlyingAddress
    if (!underlyingToken || blacklist.has(underlyingAddress.toLowerCase())) return;
    sdk.util.sumSingleBalance(balances, prefixedUnderlyingAddress, underlyingTokenBalance)
  })

  return transformBalances(chain, balances)
}

const tokensNativeToSidechain = [
  '0x2bf2ba13735160624a0feae98f6ac8f70885ea61', // xdai FRACTION
  '0x63e62989d9eb2d37dfdb1f93a22f063635b07d51', // xdai MIVA 
  '0x263026e7e53dbfdce5ae55ade22493f828922965', // polygon RIC
]

async function retrieveSupertokensBalances(chain, block, isVesting, ts, graphUrl) {
  const gblock = (await getBlock(ts, chain, { [chain]: block })) - 5000
  // Retrieve supertokens from graphql API
  const { tokens } = await request(graphUrl, supertokensQuery, { block: gblock })
  const allTokens = tokens.filter(t => t.isSuperToken)

  return getChainBalances(allTokens, chain, block, isVesting)
}

const config = {
  avax: { graph: 'https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-avalanche-c', },
  polygon: { graph: 'https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-matic', },
  xdai: { graph: 'https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-xdai', },
  optimism: { graph: 'https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-optimism-mainnet', },
  arbitrum: { graph: 'https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-arbitrum-one', },
  bsc: { graph: 'https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-bsc-mainnet', },
}

module.exports = {
  methodology: `TVL is the total quantity of tokens locked in Super Tokens from Superfluid, on Polygon and xDai (most important being weth, dai, usdc and wbtc, as well as QiDAO and MOCA)`,
  hallmarks: [
    [1644278400, "Fake ctx hack"],
  ],
};

Object.keys(config).forEach(chain => {
  const { graph } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => retrieveSupertokensBalances(chain, block, false, _, graph),
    vesting: async (_, _b, { [chain]: block }) => retrieveSupertokensBalances(chain, block, true, _, graph),
  }
})
