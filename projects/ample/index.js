const { sumERC4626VaultsExport2 } = require('../helper/erc4626')
const { getConnection, sumTokens2 } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

// EVM: ERC-4626 vaults (totalAssets of the underlying asset)
const vaults = {
  arbitrum: ['0xd1be1f98991cf69355e468ad15b6d0b6429bcfcb'],
  base: ['0x1688aeb3ec7b23a22e2418fdf5bccc67ecf39c0f'],
  katana: ['0xe5092ab6b8b0c37b1bec12c606614706063d04e8'],
  monad: ['0xE89d322b5822D828B8252D3087be8486cC2048Ef'],
  hyperliquid: ['0x00a7ab758367da6a3909b75bd30ccc68e8755809'],
  bsc: ['0x86713f2bf1969e41a5e003a97934801acd291de7'],
}

// Solana: vaults are program-owned PDAs (one per asset, currently USDC & SOL).
// Deposits are routed into Jupiter Lend, so each vault PDA holds Jupiter Lend
// receipt tokens (jlUSDC / jlWSOL), which are priced by DefiLlama.
const SOLANA_PROGRAM_ID = 'BPdfgbFKNQELh96XFqAZGBRfe3CJ6Ly1JJ4fmAVgWcU8'
const VAULT_ACCOUNT_SIZE = 424 // distinguishes vault accounts from the config account
const TOKEN_PROGRAM = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') // SPL Token

async function solanaTvl(api) {
  const connection = getConnection()
  const vaultAccounts = await connection.getProgramAccounts(new PublicKey(SOLANA_PROGRAM_ID), {
    filters: [{ dataSize: VAULT_ACCOUNT_SIZE }],
    dataSlice: { offset: 0, length: 0 }, // only pubkeys are used, skip fetching account data
  })
  // Resolve each vault PDA's token accounts and sum them as tokenAccounts. We avoid
  // sumTokens2({ owners }) because that path batches getTokenAccountsByOwner into a
  // single JSON-RPC POST, which public RPCs (incl. the CI default) reject.
  const results = await Promise.all(
    vaultAccounts.map(vault => connection.getParsedTokenAccountsByOwner(vault.pubkey, { programId: TOKEN_PROGRAM }))
  )
  const tokenAccounts = results.flatMap(res => res.value.map(ta => ta.pubkey.toString()))
  return sumTokens2({ api, tokenAccounts })
}

module.exports = {
  methodology: 'On EVM chains, TVL is the total assets of each Ample ERC-4626 vault. On Solana, TVL is the balance of tokens held by each vault PDA (deposits are deployed into Jupiter Lend). Marked as double counted because underlying deposits are also tracked by the destination protocols.',
  doublecounted: true,
  solana: { tvl: solanaTvl },
}

Object.entries(vaults).forEach(([chain, chainVaults]) => {
  module.exports[chain] = { tvl: sumERC4626VaultsExport2({ vaults: chainVaults }) }
})
