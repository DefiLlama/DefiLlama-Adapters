const { get } = require("./helper/http");
const { getTokenAccountBalances, } = require("./helper/solana");
const { transformBalances } = require("./helper/portedTokens");
const sdk = require('@defillama/sdk')

async function tvl() {
  const { official, unOfficial } = await get("https://api.raydium.io/v2/sdk/liquidity/mainnet.json")
  let raydiumData = [...official, ...unOfficial]
  let deduplicateMarkets = {}
  raydiumData.forEach(i => {
    deduplicateMarkets[i.marketAuthority] = i
  })
  raydiumData = Object.values(deduplicateMarkets)

  const balances = {}
  const getAccounts = data => data.map(i => ([i.marketBaseVault, i.marketQuoteVault])).flat()

  const blacklistedTokens = [
    'inL8PMVd6iiW3RCBJnr5AsrRN6nqr4BTrcNuQWQSkvY', // In (Sol Invictus)
    '674PmuiDtgKx3uKuJ1B16f9m5L84eFvNwj3xDMvHcbo7', // $WOOD
    'SNSNkV9zfG5ZKWQs6x4hxvBRV6s8SqMfSGCtECDvdMd', // SNS
    'A7rqejP8LKN8syXMr4tvcKjs2iJ4WtZjXNs1e6qP3m9g', // Zion
    '6xcfmgzPgABAuAfGDhvvLLMfMDur4at7tU7j3NudUviK', // Fossil
    '2Dzzc14S1D7cEFGJyMZMACuoQRHVUYFhVE74C5o8Fwau', // BAB
    'EP2aYBDD4WvdhnwWLUMyqU69g1ePtEjgYK6qyEAFCHTx', // KRILL
    'Hq9MuLDvUAWqC29JhqP2CUJP9879LfqNBHyRRREEXwtZ', // FLOCK
    '2LxZrcJJhzcAju1FBHuGvw929EVkX7R7Q8yA2cdp8q7b', // BORK
  ]

  await addDexData(raydiumData)

  return transformBalances('solana', balances)

  async function addDexData(items) {
    const tokenRes = await getTokenAccountBalances(getAccounts(items), { individual: true })
    for (let i = 0; i < tokenRes.length; i = i + 2) {
      const index = i / 2
      const { baseMint, quoteMint, } = items[index]
      if (!blacklistedTokens.includes(baseMint))
        sdk.util.sumSingleBalance(balances, baseMint, tokenRes[i].amount)
      if (!blacklistedTokens.includes(quoteMint))
        sdk.util.sumSingleBalance(balances, quoteMint, tokenRes[i + 1].amount)
    }
  }
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  },
};
