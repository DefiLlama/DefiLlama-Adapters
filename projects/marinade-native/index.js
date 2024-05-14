const { StakeProgram } = require("@solana/web3.js")
const { getConnection } = require('../helper/solana')

async function tvl() {
  const stakeAccounts = await getConnection().getProgramAccounts(StakeProgram.programId, {
    filters: [{
      memcmp: { bytes: 'stWirqFCf2Uts1JBL1Jsd3r6VBWhgnpdPxCTe1MFjrq', offset: 4 + 8 }
    }],
    dataSlice: { offset: 0, length: 1 } // we dont care about the data, just the lamports
  })

  return {
    solana: stakeAccounts.reduce((tvl, { account }) => { return tvl + account.lamports / 1e9 }, 0)
  }
}

module.exports = {
  solana: { tvl }
}