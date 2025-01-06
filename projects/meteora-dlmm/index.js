const { getProvider, sumTokens2, } = require('../helper/solana')
const { Program, } = require("@project-serum/anchor");

// https://docs.meteora.ag/dlmm/dlmm-integration/dlmm-sdk
async function tvl() {
  const provider = getProvider()
  const programId = 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo'
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)
  const pools = await program.account.lbPair.all()
  const tokenAccounts = pools.map(({ account: { reserveX, reserveY}}) => [reserveX, reserveY]).flat()
  return sumTokens2({ tokenAccounts})
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}
