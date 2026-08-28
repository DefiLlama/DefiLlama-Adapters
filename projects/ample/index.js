const { sumERC4626VaultsExport2 } = require('../helper/erc4626')
const { getConnection, sumTokens2 } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

// EVM: ERC-4626 vaults (totalAssets of the underlying asset)
const vaults = {
  ethereum: [
    '0x8D823AC5045474c845c8714b495D75b5ccB77D00', // XAUt
  ],
  arbitrum: [
    '0xd1be1f98991cf69355e468ad15b6d0b6429bcfcb', // USDC
    '0xFf2492aab4967C6209a1bF54C677d456Ce5FE220', // WETH
    '0x54a93a1399169877050efa784f9e533bb3bc170c', // XAUt0
  ],
  base: [
    '0x1688aeb3ec7b23a22e2418fdf5bccc67ecf39c0f', // USDC
    '0xfd95E1085C14e4D719C27931dB4FD409F6638b2b', // NVDAC
    '0x22799e6Fbb46E991130D2B6532eC7e0B369b8fE0', // METAC
    '0x250Cf54B4A245b19c91759647804CA33fC37cbA6', // AAPLC
    '0x6a7f3259c1a339503A417D7367DE27F483737007', // GOOGLC
  ],
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
