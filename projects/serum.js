const { getConnection, decodeAccount, blacklistedTokens_default } = require('./helper/solana')
const sdk = require('@defillama/sdk')
const { PublicKey } = require("@solana/web3.js")
const { MARKET_STATE_LAYOUT_V3_MINIMAL } = require('./helper/utils/solana/layouts/openbook-layout')

const blacklistedTokens = new Set(blacklistedTokens_default)

async function tvl(api) {
  const connection = getConnection()

  const programPublicKey = new PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin')
  const programAccounts = await connection.getProgramAccounts(programPublicKey, {
    filters: [{ dataSize: 388 }],
    dataSlice: { offset: 53, length: MARKET_STATE_LAYOUT_V3_MINIMAL.span } 
  });
  sdk.log('#markets', programAccounts.length)

  programAccounts.forEach((account) => {
    const market = decodeAccount('openbook-minimal', account.account)
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
