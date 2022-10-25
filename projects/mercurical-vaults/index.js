const { Program } = require("@project-serum/anchor");
const { getProvider, transformBalances, getTokenDecimals, } = require("../helper/solana");
const sdk = require('@defillama/sdk')

const programId = '24Uqj9JCLxUeoC3hGfh5W3s9FM9uCHDS2SG3LYwBpyTi'

async function tvl() {
  const provider = getProvider()
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)
  const vaults = (await program.account.vault.all()).map(i => i.account)
  const tokens = vaults.map(i => i.tokenMint.toString())
  const decimals = await getTokenDecimals(tokens)
  const tokenBalances = {}
  vaults.forEach((i, idx) => sdk.util.sumSingleBalance(tokenBalances, tokens[idx], i.totalAmount / (10 ** decimals[idx])))
  return transformBalances({ tokenBalances })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
}
