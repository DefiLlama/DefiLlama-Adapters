const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")
const { sumTokens: sumTokensBTC } = require("../helper/chain/bitcoin")
const { sumTokens: sumTokensLTC } = require("../helper/chain/litecoin")
const { sumTokens2: sumTokensSOL } = require("../helper/solana")
const { sumTokens: sumTokensDOGE } = require("../helper/chain/doge")
const { sumTokens: sumTokensCardano } = require("../helper/chain/cardano")
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')
const { post } = require('../helper/http')

// SoDex custody addresses on each chain
const CUSTODY_ADDRESS_1 = "0x72b2f19f05c8d78ea7bb9fb9fe551f06f31ba287"
const CUSTODY_ADDRESS_2 = "0xCC7322A2f9f82251dA51584B1a89915dBc02185B"
const CUSTODY_ADDRESS_SOL = "9RausimD22rJxJbYi56tbtxCSQw3hh5nXzYoxzZA5JrU"
const CUSTODY_ADDRESS_XRP = "rpZYyFtPPrqQetwRKAPtcSXLC8F5Tzx7FQ"
const CUSTODY_ADDRESS_DOGE = "D8Ptn3CJmNYzh9We5oP3wk1inAngPPZ7zC"
const CUSTODY_ADDRESS_ADA = "Ae2tdPwUPEYxbppqSJw4y9X8hSZ4eJwBYaYKm8ZH3HnVKLRvAGtEbTyWbYQ"
const CUSTODY_ADDRESS_LTC = "LbrYhw79HFCkmArrUiAjTrczmYqB8VDHop"

// Token addresses
const XAUT = "0x68749665FF8D2d112Fa859AA293F07A622782F38"  // Tether Gold on Ethereum
const SOSO_ETH = "0x76a0e27618462bdac7a29104bdcfff4e6bfcea2d"  // SOSO on Ethereum
const SOSO_BASE = "0x624e2e7fdc8903165f64891672267ab0fcb98831"  // SOSO on Base
const MAG7_BASE = "0x9e6a46f294bb67c20f1d1e7afb0bbef614403b55"  // MAG7.ssi on Base
const SMAG7_BASE = "0x3d8f0ddb4bb9332Cb89dEC22d273d9be1a91530b"  // Staked MAG7.ssi on Base

// Bitcoin TVL
async function btcTvl(api) {
  return sumTokensBTC({ owners: bitcoinAddressBook.sodex })
}

// Litecoin TVL
async function ltcTvl(api) {
  return sumTokensLTC({ owners: [CUSTODY_ADDRESS_LTC] })
}

// Solana TVL
async function solTvl(api) {
  return sumTokensSOL({ api, solOwners: [CUSTODY_ADDRESS_SOL] })
}

// Dogecoin TVL
async function dogeTvl(api) {
  return sumTokensDOGE({ owners: [CUSTODY_ADDRESS_DOGE] })
}

// Cardano TVL
async function adaTvl(api) {
  return sumTokensCardano({ api, owners: [CUSTODY_ADDRESS_ADA] })
}

// Ripple TVL
async function xrpTvl(api) {
  const body = { "method": "account_info", "params": [{ account: CUSTODY_ADDRESS_XRP }] }
  const res = await post('https://s1.ripple.com:51234', body)
  if (res.result.error === 'actNotFound') return {}
  const balance = res.result.account_data.Balance / 1e6
  return { ripple: balance }
}

module.exports = {
  methodology: "TVL is calculated as the sum of all assets held in SoDex custody addresses across multiple chains. SOSO token holdings are tracked separately as staking.",
  timetravel: false,
  bitcoin: {
    tvl: btcTvl,
  },
  ethereum: {
    tvl: sumTokensExport({
      owners: [CUSTODY_ADDRESS_1],
      tokens: [
        ADDRESSES.null,           // ETH
        ADDRESSES.ethereum.USDC,  // USDC
        ADDRESSES.ethereum.LINK,  // LINK
        ADDRESSES.ethereum.AAVE,  // AAVE
        ADDRESSES.ethereum.UNI,   // UNI
        XAUT,                     // XAUt (Tether Gold)
      ]
    }),
    staking: sumTokensExport({
      owners: [CUSTODY_ADDRESS_2],
      tokens: [SOSO_ETH]
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: [CUSTODY_ADDRESS_1],
      tokens: [
        ADDRESSES.null,        // BNB
        ADDRESSES.bsc.USDC,    // USDC
      ]
    }),
  },
  solana: {
    tvl: solTvl,
  },
  ripple: {
    tvl: xrpTvl,
  },
  doge: {
    tvl: dogeTvl,
  },
  cardano: {
    tvl: adaTvl,
  },
  litecoin: {
    tvl: ltcTvl,
  },
  base: {
    tvl: sumTokensExport({
      ownerTokens: [
        // Custody address 1: ETH, USDC
        [[ADDRESSES.null, ADDRESSES.base.USDC], CUSTODY_ADDRESS_1],
        // Custody address 2: MAG7.ssi, staked MAG7.ssi (non-SOSO tokens)
        [[MAG7_BASE, SMAG7_BASE], CUSTODY_ADDRESS_2],
      ]
    }),
    staking: sumTokensExport({
      owners: [CUSTODY_ADDRESS_2],
      tokens: [SOSO_BASE]
    }),
  },
  arbitrum: {
    tvl: sumTokensExport({
      owners: [CUSTODY_ADDRESS_1],
      tokens: [
        ADDRESSES.null,                 // ETH
        ADDRESSES.arbitrum.USDC_CIRCLE, // USDC (native Circle)
      ]
    }),
  },
  hyperliquid: {
    tvl: sumTokensExport({
      owners: [CUSTODY_ADDRESS_1],
      tokens: [
        ADDRESSES.null,               // native (for gas)
        ADDRESSES.hyperliquid.WHYPE,  // HYPE token
      ]
    }),
  },
}
