const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { sumTokensExport: sumSolanaTokensExport } = require('../helper/solana')

// Ignite custody vaults. Traders deposit into these contracts, orders are matched on the
// Ignite order book, and withdrawals are released from the same vaults.
// Live list: https://api.ignite.trade/v1/escrow/config and https://api.ignite.trade/v1/solana/status
const EVM_VAULTS = {
  ethereum: {
    owner: '0x01dDd01Ba9C32795a39cfDa71184958d47E0a08E',
    tokens: [
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.USDT,
      '0xbd79b7db6f70979df7f4124e161eb3586085d140', // LAX
      '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39', // HEX
      '0xff74317e948695297acb79cb2de06111f5cc16b3', // ONE
    ],
  },
  base: {
    owner: '0x01dDd01Ba9C32795a39cfDa71184958d47E0a08E',
    tokens: [
      ADDRESSES.base.USDC,
      ADDRESSES.base.USDT,
      '0xe7645444eb4e8e04d886c7038dd0152d331d3680', // LAX
    ],
  },
  bsc: {
    owner: '0x4368ED53e2F31F5B3540369466E5775fD0422eDE',
    tokens: [
      ADDRESSES.bsc.USDC,
      ADDRESSES.bsc.USDT,
      '0x11125e44843170467a7955d29776d63760ea4b6e', // LAX
      '0xb2a1ca465cc250cdc16639e49be0d948e095febc', // JOT
      '0x528605856a9eb9567688b0e912ed6961522a74d4', // MUSA
      '0x36b2269fd151208a4bfc3dea503e0a6f2485fa78', // TUA
      '0x21d6d37411d86fafdc565260e81e7a585bc44119', // FGPT
      '0xaeb63742f2c7dd1538bbe2285b6789017a06b58b', // COLLE
      '0x2e156a3e09782a785345b7a33c46c71596ffd551', // IMAGE
    ],
  },
}

// Squads multisig vault (multisig EaPDGTPXFun7oLAv7ApwBUZfAHruxrAQTBTE9L7TDmT8, vault index 0):
// holds SOL and the SPL / Token-2022 deposits (USDC, BYTE, MEPI, ...).
const SOLANA_VAULT = '6ShdjduDkwcBi9jEeYQFbAvsqUGgYrX2ASxjfHypEkYa'

module.exports = {
  methodology: 'TVL is the balance of the assets held in the Ignite custody vaults: the escrow vault contracts on Ethereum, Base and BNB Chain, and the Squads multisig vault on Solana. It includes trader deposits and the liquidity in Ignite pools, which is held in the same vaults.',
  solana: { tvl: sumSolanaTokensExport({ owner: SOLANA_VAULT, solOwners: [SOLANA_VAULT] }) },
}

Object.entries(EVM_VAULTS).forEach(([chain, { owner, tokens }]) => {
  module.exports[chain] = { tvl: sumTokensExport({ owner, tokens }) }
})
