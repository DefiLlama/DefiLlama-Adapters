const { getProvider, sumTokens2, } = require('../helper/solana')
const { Program, } = require("@project-serum/anchor");
const { getEnv } = require('../helper/env');
const idl = require('./idl.json');

// DAMM v2 Program ID
const DAMM_PROGRAM_ID = 'cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG'

async function tvl() {
  if (!getEnv('IS_RUN_FROM_CUSTOM_JOB')) throw new Error('This job is not meant to be run directly, please use the custom job feature')

  const provider = getProvider()
  const program = new Program(idl, DAMM_PROGRAM_ID, provider)

  // Get all Pool accounts
  const pools = await program.account.pool.all()

  // Extract token vault addresses from pools
  const tokenAccounts = []
  pools.forEach(({ account: pool }) => {
    if (pool.tokenAVault) tokenAccounts.push(pool.tokenAVault.toString())
    if (pool.tokenBVault) tokenAccounts.push(pool.tokenBVault.toString())
  })

  return sumTokens2({ tokenAccounts })
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  solana: { tvl, },
  methodology: 'TVL is calculated by summing token balances in Meteora DAMM v2 liquidity pools. This adapter specifically tracks DAMM v2 pools (program ID: cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG) which are not counted by the existing Meteora DLMM or stable swap adapters.'
}