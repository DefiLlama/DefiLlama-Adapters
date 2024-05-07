const { StakeProgram } = require("@solana/web3.js")
const { getConnection } = require('../helper/solana')

async function tvl() {
  let hasNext = true
  let offset = 0
  let length = 9
  let nativeTvl = 0
  do {
    const _stakeAccounts = await getConnection().getProgramAccounts(StakeProgram.programId, {
      filters: [{
        memcmp: { bytes: 'stWirqFCf2Uts1JBL1Jsd3r6VBWhgnpdPxCTe1MFjrq', offset: 4 + 8 }
      }],
      dataSlice: { offset, length }
    })
    nativeTvl += _stakeAccounts.reduce((tvl, { account }) => { return tvl + account.lamports / 1e9 }, 0)

    hasNext = _stakeAccounts.length === length
    offset += length
  } while (hasNext)

  return {
    solana: nativeTvl
  }
}

module.exports = {
  solana: { tvl }
}