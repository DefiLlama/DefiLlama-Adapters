const retry = require('../helper/retry')
const { sumTokens2, getConnection } = require('../helper/solana')
const { PublicKey, } = require("@solana/web3.js")
const { GraphQLClient, gql } = require('graphql-request')
const { MintLayout, } = require("@solana/spl-token")
const { sliceIntoChunks } = require('../helper/utils')

const API_URL = 'https://api.cryptocurrencies.ai/graphql'
// for fetching volume
// {"operationName":"getTradingVolumeForAllPools","variables":{"timestampTo":1664701199,"timestampFrom":1664614799},"query":"query getTradingVolumeForAllPools($timestampFrom: Int!, $timestampTo: Int!) {\n  getTradingVolumeForAllPools(timestampFrom: $timestampFrom, timestampTo: $timestampTo) {\n    pool\n    tradingVolume\n    __typename\n  }\n}\n"}

async function tvl() {
  var graphQLClient = new GraphQLClient(API_URL)
  const connection = await getConnection()

  var query = gql`
    {
      getPoolsInfo {    name    parsedName    swapToken    poolTokenMint    tokenA    tokenB    tokenADecimals    tokenBDecimals    poolTokenAccountA    poolTokenAccountB    lpTokenFreezeVaultBalance    lpTokenFreezeVault    tvl {      tokenA      tokenB      __typename    }    fees {      tradeFeeDenominator      ownerTradeFeeDenominator      tradeFeeNumerator      ownerTradeFeeNumerator      __typename    }    apy24h    supply    curve    amp    initializerAccount    curveType    farming {      farmingState      farmingTokenVault      farmingTokenMint      farmingTokenMintDecimals      farmingSnapshots      tokensUnlocked      tokensTotal      tokensPerPeriod      periodLength      vestingPeriod      currentTime      __typename    }    __typename  }
    }
    `;

  const results = await retry(async bail => await graphQLClient.request(query))
  const {
    getPoolsInfo: poolInfos
  } = results

  const tokensAndOwners = []
  const chunks = sliceIntoChunks(poolInfos, 99)
  for (const chunk of chunks) {
    const poolAccounts = await connection.getMultipleAccountsInfo(chunk.map(i => new PublicKey(i.poolTokenMint)))
    poolAccounts.forEach((account, i) => chunk[i].mintAuthoritiy = new PublicKey(MintLayout.decode(account.data).mintAuthority))
    chunk.forEach(({ mintAuthoritiy, tokenA, tokenB }) => tokensAndOwners.push([tokenA, mintAuthoritiy], [tokenB, mintAuthoritiy]))
  }
  return sumTokens2({ tokensAndOwners, blacklistedTokens: ['A7rqejP8LKN8syXMr4tvcKjs2iJ4WtZjXNs1e6qP3m9g'], })
}

async function staking() {
  return sumTokens2({ tokenAccounts: ['BAhtu6WzzTY72abMwNcjm8P6QvASaQNWnLY94ma69ocu'] })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  solana: { tvl, staking  },
  hallmarks:[
    [1665521360, "Mango Markets Hack"],
  ],
}
