const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2, } = require("../helper/solana");
const { PublicKey, SystemProgram } = require("@solana/web3.js");

async function tvl() {

  const programId = new PublicKey('dvyFwAPniptQNb1ey4eM12L8iLHrzdiDsPPDndd6xAR')
  const provider = getProvider()
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)
  const houses = await program.account.house.all()
  const tokensAndOwners = houses.map(house => {
    const owner = PublicKey.findProgramAddressSync([house.publicKey.toBuffer(), Buffer.from(house.account.authorityBump.toString())], SystemProgram.programId)[0]
    return [house.account.currency, owner]
  })
  return sumTokens2({ tokensAndOwners })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
}
