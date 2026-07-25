const { PublicKey } = require('@solana/web3.js')
const { getConnection, sumTokens2 } = require('../helper/solana')

// Cookie Bridge is a Hyperlane warp route between Solana and Cookie Chain (a
// Solana / Agave fork). It is collateral <-> collateral: SPL COOK is locked in
// a warp escrow on Solana, native COOK is locked in a warp collateral PDA on
// Cookie Chain, and the relayer releases 1:1 from the destination pool. Nothing
// synthetic is minted, so summing both locked pools is the TVL with no
// double-counting. Both chains are indexed and priced by DefiLlama (COOK,
// confidence ~0.99), so each pool is reported under its own chain.

// Solana side: warp escrow token account holding SPL COOK (Token-2022, 6dp).
const SOLANA_ESCROW = '88q7zoKctwAQRsoTxkMJy95sNE3tntuyEhSrhvR1eZwq'

// Cookie Chain side: native-collateral PDA holding native COOK (9dp). Native
// COOK is priced as the wrapped mint (Solana fork => same address as wSOL).
const COOKIE_COLLATERAL_PDA = new PublicKey('CL2JoQ5jdTpRNKshWhaTihuooT4qrKdLUiPsqKj3yAKz')
const WRAPPED_COOK = 'So11111111111111111111111111111111111111112'

async function solanaTvl(api) {
  await sumTokens2({ api, tokenAccounts: [SOLANA_ESCROW] })
}

async function cookiechainTvl(api) {
  const connection = getConnection(api.chain)
  const lamports = await connection.getBalance(COOKIE_COLLATERAL_PDA)
  api.add(WRAPPED_COOK, lamports)
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL counts the COOK locked as collateral in the Hyperlane warp route that bridges COOK between Solana and Cookie Chain: SPL COOK held in the escrow on Solana plus native COOK held on Cookie Chain. Bridging locks and releases the same COOK 1:1 with no wrapped or minted supply.',
  solana: { tvl: solanaTvl },
  cookiechain: { tvl: cookiechainTvl },
}
