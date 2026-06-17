const { getProvider } = require("../helper/solana");
const { Program } = require("@coral-xyz/anchor");
const idl = require('./idl.json')

const SYNTHETIC_MINT_MAP = {
  'USD1111111111111111111111111111111111111111': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // synthetic USD -> USDC
  'USD1111111111111111111111111111111111111119': 'DEkqHyPN7GMRJ5cArtQFAWefqbZb33Hyf6s5iCwjEonT', // synthetic USD9 -> USDe
}

async function tvl(api) {
  const program = new Program(idl, getProvider())
  const vaults = await program.account.exponentStrategyVault.all()
  for (const { account } of vaults) {
    // skip non-active vaults that aren't shown on the UI
    if (account.statusFlags === 8) continue
    const total = BigInt(account.financials.aumInBase.toString()) + BigInt(account.financials.aumInBaseInPositions.toString())
    if (total <= 0n) continue
    const mint = account.underlyingMint.toBase58()
    api.add(SYNTHETIC_MINT_MAP[mint] || mint, total)
  }
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: 'Sum of each strategy vault\'s on-chain `aumInBase` (idle reserves) and `aumInBaseInPositions` (value of deployed positions).',
  solana: { tvl },
};
