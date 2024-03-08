const anchor = require("@coral-xyz/anchor");
const { sumTokens2, getProvider, } = require("../helper/solana");

const programId = new anchor.web3.PublicKey(
    'C1onEW2kPetmHmwe74YC1ESx3LnFEpVau6g2pg4fHycr')

async function tvl() {
  const provider = getProvider()
  const idl = await anchor.Program.fetchIdl(programId, provider)
  const program = new anchor.Program(idl, programId, provider)

  let owners = []
  let tokens = []

  const cloneAccountAddress = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("clone")], programId)[0]

  const cloneAccount = await program.account.clone.fetch(cloneAccountAddress)
  owners.push(cloneAccount.collateral.vault.toString())
  tokens.push(cloneAccount.collateral.mint.toString())

  return sumTokens2({ 
      tokens,
      owners,
  })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
  methodology:
    'Return the amount of collateral in the vault.'
}
