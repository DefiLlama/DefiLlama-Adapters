const { Program } = require("@project-serum/anchor");
const { getProvider, } = require("../helper/solana");
const sdk = require('@defillama/sdk')

const programId = '24Uqj9JCLxUeoC3hGfh5W3s9FM9uCHDS2SG3LYwBpyTi'

async function tvl(api) {
  const provider = getProvider()
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)
  const vaults = (await program.account.vault.all()).map(i => i.account)
  const tokens = vaults.map(i => i.tokenMint.toString())
  vaults.forEach((i, idx) => api.add(tokens[idx], +i.totalAmount))
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
}
