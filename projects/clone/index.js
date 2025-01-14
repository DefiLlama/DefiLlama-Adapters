const { Program } = require("@project-serum/anchor");
const { sumTokens2, getProvider, } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js")

const programId = new PublicKey('C1onEW2kPetmHmwe74YC1ESx3LnFEpVau6g2pg4fHycr')

async function tvl() {
  const provider = getProvider()
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)

  let tokenAccounts = []

  const cloneAccountAddress = PublicKey.findProgramAddressSync(
    [Buffer.from("clone")], programId)[0]

  const cloneAccount = await program.account.clone.fetch(cloneAccountAddress)
  tokenAccounts.push(cloneAccount.collateral.vault.toString())

  return sumTokens2({ tokenAccounts })
}

module.exports = {
  deadFrom: "2024-09-30",
  hallmarks: [[1727654400, "Clone Sunset"]],
  timetravel: false,
  solana: { tvl : () => ({})},
  methodology: 'Return the amount of collateral in the vault.'
}
