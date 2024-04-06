const { StakeProgram } = require("@solana/web3.js")
const { getConnection } = require('../helper/solana')

async function tvl(api) {
  const stakeAccounts = await getConnection().getProgramAccounts(StakeProgram.programId, {
    filters: [{
      memcmp: {
        bytes: 'stWirqFCf2Uts1JBL1Jsd3r6VBWhgnpdPxCTe1MFjrq',
        offset: 4 + 8
      }
    }]
  })

  const nativeTvl = stakeAccounts.reduce((tvl, { account }) => {
    return tvl + account.lamports/1e9
  }, 0)

  return {
    solana: nativeTvl
  }
}

module.exports = {
  solana: { tvl }
}