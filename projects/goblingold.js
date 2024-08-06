const { getProvider, } = require('./helper/solana')
const { Program, } = require("@project-serum/anchor");
const vaults = {
  "BTC": "FvqYV2Cg7s7iWKUBTWkyybKuz1m85ny6ijDqDXEXVyNv",
  "ETH": "u11s7BKVbYncjcMJX2HjKeahfRuzNovQWtcpJhCTP1x",
  "MNGO": "E5znWeT1pEiMXpko8JUNvGfs1X6cuupHZB2PeDhx5mt8",
  "ORCA": "9b2J1JjsvnkLc9ZQmARDbq7EMhCDzr4QG4fAR6TfZkTK",
  "RAY": "6w6NRsDUnBieNiVBHoixEqqfGnr2wXdoSWWZRn7S36db",
  "SAMO": "g5S5WcsYn9CJE6VSwaCoaESZq3Da9Mn7gvt1MB2MFmU",
  "SRM": "3MvY3Tk3PmQhEeHqyfJA9gDBq83MUM92rgbhLeY27JLv",
  "USDC": "ATJpBsXbhio5c5kqgMHmAfFDdjsS3ncZmZyZzNY87XqZ",
  "USDT": "ATpgW6RzUvEt13rU9NMj1HsmEeW2zC9a1k5AQbako8md",
  "WSOL": "CNJrJumoPRxvCaQZ2MJTEUUitwwen955JsxiUvoJa7Wp",
  "mSOL": "7reMieMkh3MCJXQqmnv9xhCBcy3B5qaGbhf6HC8kZFyc",
  "soETH": "B7TjXfMHG6sun7KdGFb4sWVCKikTKuaYitbosKc37vVf",
  "stSOL": "47hnvWxWo4PpPNqPF78cJ4abjpT45qY9of8hokeLzEUX"
}

async function tvl(api) {

  const provider = getProvider()
  const programId = 'GGo1dnYpjKfe9omzUaFtaCyizvwpAMf3NhxSCMD61F3A'
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)
  const data = await program.account.vaultAccount.fetchMultiple(Object.values(vaults))
  data.forEach(i => api.add(i.inputMintPubkey.toString(), i.currentTvl))
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}
