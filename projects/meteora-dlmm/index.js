const { getProvider, sumTokens2, } = require('../helper/solana')
const { Program, } = require("@project-serum/anchor");
const idl = require('./idl.json');
const { getEnv } = require('../helper/env');

// https://docs.meteora.ag/dlmm/dlmm-integration/dlmm-sdk
async function tvl() {
  if (!getEnv('IS_RUN_FROM_CUSTOM_JOB')) throw new Error('This job is not meant to be run directly, please use the custom job feature')

  const provider = getProvider()
  const programId = 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo'
  // const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)
  const pools = await program.account.lbPair.all()
  const tokenAccounts = pools.map(({ account: { reserveX, reserveY } }) => [reserveX, reserveY]).flat()
  return sumTokens2({ tokenAccounts })
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  solana: { tvl, },
}
