const { PublicKey } = require('@solana/web3.js')

const EXPONENT_STRATEGY_VAULTS_PROGRAM_ID = new PublicKey('sVau1tXvayVWfotzm9Ahcv2qfnnfRWttt78BCnNC6dD')
const EXPONENT_CORE_PROGRAM_ID = new PublicKey('ExponentnaRg3CQbW6dqQNZKXp7gtZ9DGMp1cwC4HAS7')
const EXPONENT_CLMM_PROGRAM_ID = new PublicKey('XPC1MM4dYACDfykNuXYZ5una2DsMDWL24CrYubCvarC')
const KAMINO_LENDING_PROGRAM_ID = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD')
const KAMINO_FARMS_PROGRAM_ID = new PublicKey('FarmsPZpWu9i7Kky8tPN37rs2TpmMrAZrC7S7vJa91Hr')
const LOOPSCALE_PROGRAM_ID = new PublicKey('1oopBoJG58DgkUVKkEzKgyG9dvRmpgeEm1AVjoHkF78')

const EXPONENT_STRATEGY_VAULT_DISCRIMINATOR = Buffer.from([98, 228, 39, 201, 116, 210, 39, 11])

const SYNTHETIC_USD_MINT = 'USD1111111111111111111111111111111111111111'
const SYNTHETIC_USD9_MINT = 'USD1111111111111111111111111111111111111119'
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const USDE_MINT = 'DEkqHyPN7GMRJ5cArtQFAWefqbZb33Hyf6s5iCwjEonT'

function resolveManagedUnderlyingMint(underlyingMint) {
  if (underlyingMint === SYNTHETIC_USD_MINT) return USDC_MINT
  if (underlyingMint === SYNTHETIC_USD9_MINT) return USDE_MINT
  return underlyingMint
}

function getKaminoFarmsObligationFarm(obligation, farm, programId = KAMINO_FARMS_PROGRAM_ID) {
  return PublicKey.findProgramAddressSync([
    Buffer.from('user'),
    farm.toBuffer(),
    obligation.toBuffer(),
  ], programId)[0]
}

module.exports = {
  EXPONENT_CLMM_PROGRAM_ID,
  EXPONENT_CORE_PROGRAM_ID,
  EXPONENT_STRATEGY_VAULTS_PROGRAM_ID,
  EXPONENT_STRATEGY_VAULT_DISCRIMINATOR,
  KAMINO_FARMS_PROGRAM_ID,
  KAMINO_LENDING_PROGRAM_ID,
  LOOPSCALE_PROGRAM_ID,
  getKaminoFarmsObligationFarm,
  resolveManagedUnderlyingMint,
}
