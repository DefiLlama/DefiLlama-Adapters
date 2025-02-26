const { getConnection, decodeAccount, sumTokens2 } = require('../helper/solana')
const sdk = require('@defillama/sdk')
const { PublicKey } = require("@solana/web3.js")

async function tvl(api) {
  throw new Error('Try to find tvl some other way, too many tokenaccount calls and it is overwhelming the system')
  const connection = getConnection()

  const programPublicKey = new PublicKey('FLUXubRmkEi2q6K3Y9kBPg9248ggaZVsoSFhtJHSrm1X')
  const programAccounts = await connection.getProgramAccounts(programPublicKey, {
    filters: [{ dataSize: 324 }    ]
  });
  sdk.log('#pools', programAccounts.length)

  const tokenAccounts = programAccounts.map((account) => {
    const i = decodeAccount('fluxbeam', account.account)
    return [i.tokenAccountA, i.tokenAccountB]
  }).flat().map(i => i.toString())
  return sumTokens2({ tokenAccounts, allowError: true })
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
  isHeavyProtocol: true,
}
3