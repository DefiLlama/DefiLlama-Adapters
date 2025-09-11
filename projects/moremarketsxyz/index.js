const axios = require('axios')
const ADDRESSES = require('../helper/coreAssets.json')

// ─────────────────────────────────────────────────────────────────────────────
// MoreMarkets DeFiLlama adapter
//
// How we compute TVL (high-level):
// • XRP path ("xrp"): We return the XRP balance (in DROPS) of our XRP MPC wallet.
//   - XRP MPC wallet: rPRcZswAjfHzUbCj44YzFhNdB1c8Yux5aT(https://xrpscan.com/account/rPRcZswAjfHzUbCj44YzFhNdB1c8Yux5aT)
// • Ethereum path ("rlusd"): We return RLUSD held by the Term Strategy RLUSD Vault,
//   reported as ERC-4626 totalAssets() in WEI under the RLUSD ERC-20 address.
//   - Term RLUSD Vault (app link): https://app.term.finance/vaults/0xb962fd1abd9a365140493bd499acf1ec0acff040/1
//   - Term RLUSD Vault (contract): 0xb962fd1aBd9A365140493Bd499AcF1eC0AcfF040
//   - RLUSD (Ethereum token):     0x8292Bb45bf1Ee4d140127049757C2E0fF06317eD
//
// Extra refs:
// • MOREXRP+ : 0xBF305716623B95F8553916ca569F939A8f5E3668
//
// Full methodology & FAQs: https://www.moremarkets.xyz/blog/moremarkets-xrp-earn-account-protocol-overview-and-faqs
//
// Backend API we call:
//   GET https://api.moremarkets.xyz/api/defillama/balances?token=xrp  → { balances: { "XRP": "<drops>" } }
//   GET https://api.moremarkets.xyz/api/defillama/balances?token=rlusd   → { balances: { "0xRLUSD": "<wei>" } }
//
// Notes:
// • We return RAW base units only: DROPS for XRP, WEI for RLUSD.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = 'https://api.moremarkets.xyz/api'

function makeTVL(param) {
  return async (api) => {
    const { data } = await axios.get(`${BASE}/defillama/balances?token=${param}`)
    const balances = data?.balances || {}

    for (const [addr, raw] of Object.entries(balances)) {
      const key = (param === 'xrp' && addr === 'XRP')
        ? ADDRESSES.ripple.XRP // XRP, value is drops
        : addr // RLUSD, value is WEI
      api.add(key, raw)
    }
    return api.getBalances()
  }
}

module.exports = {
  methodology:
    "TVL is aggregated on the MoreMarkets backend: (1) XRP from our XRP MPC wallet (in DROPS) and (2) RLUSD from Term's RLUSD Strategy Vault via ERC-4626 totalAssets() (in WEI). See our blog for full details and operational context.",
  timetravel: false,
 
  ripple:   { tvl: makeTVL('xrp') }, 
  ethereum: { tvl: makeTVL('rlusd') }, 
}