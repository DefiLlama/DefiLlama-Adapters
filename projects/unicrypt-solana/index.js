const { addAmmLocks } = require('./ammv4')
const { addCpSwapLocks } = require('./cpswap')
const { addClmmLocks } = require('./clmm')
const { addMeteoraLocks } = require('./meteora-dlmm')

async function tvl(api) {
  await addAmmLocks(api)
  await addCpSwapLocks(api)
  await addClmmLocks(api)
  await addMeteoraLocks(api)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'TVL is computed fully onchain: AMM/CP-Swap locks are valued from live UNCX LP vault balances plus live pool reserves/supply, CLMM locks are decoded and unwrapped to underlying token amounts from Raydium position/pool state, and Meteora locks are decoded from locker TokenLock accounts and valued from DLMM Position/BinArray/LbPair state.',
  solana: { tvl },
}
