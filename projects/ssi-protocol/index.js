const { sumTokensExport } = require('../helper/sumTokens')

const SWAP_CONTRACT = '0x640cB7201810BC920835A598248c4fe4898Bb5e0'

// Custody wallets returned by getTakerAddresses() on SWAP_CONTRACT on Base.
const EVM_CUSTODY_OWNERS = [
  '0x605B50f07F46251A7A39fA18C2247FB612f7452F',
  '0x55ac87E54019fa2e2156a0fAf13176DcdDFA16ce',
]

const ETH_TOKENS = [
  '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK
  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
  '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // AAVE
  '0x57e114B691Db790C35207b2e685D4A43181e6061', // ENA
  '0xfAbA6f8e4a5E8Ab82F62fe7C39859FA577269BE3', // ONDO
  '0x56072C95FAA701256059aa122697B133aDEd9279', // SKY
  '0xD533a949740bb3306d119CC777fa900bA034cd52', // CRV
  '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', // SHIB
  '0x6982508145454Ce325dDbE47a25d4ec3d2311933', // PEPE
  '0xE0f63A424a4439cBE457D80E4f4b51aD25b2c56C', // SPX
]

const BSC_TOKENS = [
  '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // CAKE
  '0xfb5B838b6cfEEdC2873aB27866079AC55363D37E', // FLOKI
]

const SOLANA_CUSTODY_OWNERS = [
  'GQkn3fPeCV4pH1MGZVHsWPpRdq5ENYnaB8GVwSubjkCZ',
  '8yVXip9eFwdmrbTxPqHsuCvVR5ktBdLGz7S1bUpSx7j6',
  'CeuKmW1XqgKz4E8JNpZxrysMRsvkEz55qUvm9soqhALY',
]

const SOLANA_TOKENS = [
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', // JUP
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8BopzLHYxdM65zcjm', // WIF
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
  '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN', // TRUMP
  '2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv', // PENGU
  'pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn', // PUMP
]

const SOLANA_TOKENS_AND_OWNERS = SOLANA_TOKENS
  .map(token => SOLANA_CUSTODY_OWNERS.map(owner => [token, owner]))
  .flat()

module.exports = {
  methodology: `TVL counts assets held in SSI protocol custody addresses on each chain. Custody addresses are exposed by the SSI swap contract (${SWAP_CONTRACT}) getTakerAddresses() on Base; basket composition view functions are not used for TVL.`,
  ethereum: {
    tvl: sumTokensExport({ owners: EVM_CUSTODY_OWNERS, tokens: ETH_TOKENS }),
  },
  bsc: {
    tvl: sumTokensExport({ owners: EVM_CUSTODY_OWNERS, tokens: BSC_TOKENS }),
  },
  solana: {
    tvl: sumTokensExport({ tokensAndOwners: SOLANA_TOKENS_AND_OWNERS, computeTokenAccount: true, allowError: true }),
  },
  bitcoin: {
    tvl: sumTokensExport({ owners: ['1BH4rZH7ptWyjim6fLJDp9t8Jp2DgXiBDM'] }),
  },
  doge: {
    tvl: sumTokensExport({ owners: ['D5gedqfZm198AyTFVg8NqWFUh8bFTdmKj7', 'DPQ3EbacSG6gdakZmXwMu7qS6SbpRUjY4a'] }),
  },
  ripple: {
    tvl: sumTokensExport({ owners: ['rp53vxWXuEe9LL6AHcCtzzAvdtynSL1aVM'] }),
  },
  cardano: {
    tvl: sumTokensExport({ owners: ['addr1v9nkv9p0gz83ha7hx0h6pg6lrte0t0dsj8tyersc8np5gegrwwxpp'] }),
  },
}
