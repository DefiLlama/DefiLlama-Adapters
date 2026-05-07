const { getProvider } = require('../helper/solana')
const { Program } = require('@project-serum/anchor')
const idl = require('./idl.json')

const PROGRAM_ID = 'AGGREbma2Gi9unS1mPptAcG4HmkMTLNmqcunYaSSf46b'

const tvl = async (api) => {
  const provider = getProvider()
  const program = new Program(idl, PROGRAM_ID, provider)

  const vaults = await program.account.poolVault.all()

  for (const { account: pool } of vaults)
    api.add(pool.tokenMint.toBase58(), pool.depositTokens.toString())
}

module.exports = {
  methodology: 'Sum of all assets deposited into the AggreLend protocol for yield aggregation.',
  doublecounted: true,
  timetravel: false,
  solana: { tvl },
}
