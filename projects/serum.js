const { getConnection, decodeAccount, } = require('./helper/solana')
const sdk = require('@defillama/sdk')
const { PublicKey } = require("@solana/web3.js")

const blacklistedTokens = new Set([
  '674PmuiDtgKx3uKuJ1B16f9m5L84eFvNwj3xDMvHcbo7', // $WOOD
  'SNSNkV9zfG5ZKWQs6x4hxvBRV6s8SqMfSGCtECDvdMd', // SNS
  'A7rqejP8LKN8syXMr4tvcKjs2iJ4WtZjXNs1e6qP3m9g', // ZION
])

async function tvl(_, _1, _2, { api }) {
  const connection = getConnection()

  const programPublicKey = new PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin')
  const programAccounts = await connection.getProgramAccounts(programPublicKey, {
    filters: [{ dataSize: 388 }]
  });
  sdk.log('#markets', programAccounts.length)

  programAccounts.forEach((account) => {
    const market = decodeAccount('openbook', account.account)
    const baseToken = market.baseMint.toBase58()
    const quoteToken = market.quoteMint.toBase58()
    const baseBal = +market.baseDepositsTotal + +market.baseFeesAccrued
    const quoteBal = +market.quoteDepositsTotal + +market.quoteFeesAccrued
    if (!blacklistedTokens.has(baseToken)) api.add(baseToken, baseBal)
    if (!blacklistedTokens.has(quoteToken)) api.add(quoteToken, quoteBal)
  });
}

module.exports = {
  timetravel: false,
  hallmarks: [
    [1667826000, "FTX/Alameda collapse"],
    [1680310800, "Move to onchain data"],
  ],
  solana: { tvl, },
}
