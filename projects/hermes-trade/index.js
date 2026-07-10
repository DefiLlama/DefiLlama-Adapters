const { sumTokensExport } = require('../helper/sumTokens')

// Hermes Trade - prediction market on Monad
// All user collateral is custodied in the Treasury/Custody contract.
// TVL = USDC + enzoBTC held in that vault. USDW is the internal receipt
// token (a claim on these underlying assets) and is intentionally excluded.
const TREASURY = '0x8dd9F55e480d13a11B7b134C832B5D21844bb822'
const USDC = '0x754704Bc059F8C67012fEd69BC8A327a5aafb603'
const enzoBTC = '0xD7aCB868F97F8286D5d3A0Fd5Ef112a8a72eCD90'

module.exports = {
  methodology:
    'TVL is the USDC and enzoBTC held as collateral in the Hermes Trade custody/treasury contract on Monad (0x8dd9F55e480d13a11B7b134C832B5D21844bb822). The internal USDW receipt token is excluded to avoid double-counting.',
  monad: {
    tvl: sumTokensExport({ owner: TREASURY, tokens: [USDC, enzoBTC] }),
  },
}
