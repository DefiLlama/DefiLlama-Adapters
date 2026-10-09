const { Program } = require("@coral-xyz/anchor")
const { PublicKey } = require("@solana/web3.js")
const { getProvider } = require("../helper/solana")

const PROGRAM_ID = new PublicKey("save8RQVPMWNTzU18t3GBvBkN9hT7jsGjiCQ28FpD9H")

async function tvl(api) {
  const provider = getProvider()
  const idl = await Program.fetchIdl(PROGRAM_ID, provider)

  if (!idl) throw new Error("Perena Vaults IDL not found")

  const program = new Program(idl, provider)
  const vaults = await program.account.vault.all()

  for (const { account } of vaults) {
    const tvl = Number(account.accounting.tvl.toString()) / 10 ** account.config.assetDecimals
    api.addUSDValue(tvl)
  }
}

module.exports = {
  timetravel: false,
  solana: { tvl },
}
