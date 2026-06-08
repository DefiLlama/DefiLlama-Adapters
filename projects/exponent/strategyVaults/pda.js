const { PublicKey } = require('@solana/web3.js')

const { EXPONENT_CORE_PROGRAM_ID } = require('./constants')

function corePda(seeds) {
  return PublicKey.findProgramAddressSync(seeds, EXPONENT_CORE_PROGRAM_ID)[0]
}

function mintPt(vault) {
  return corePda([Buffer.from('mint_pt'), vault.toBuffer()])
}

function mintYt(vault) {
  return corePda([Buffer.from('mint_yt'), vault.toBuffer()])
}

module.exports = {
  mintPt,
  mintYt,
}
