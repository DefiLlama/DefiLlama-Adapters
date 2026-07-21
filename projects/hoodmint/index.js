const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// HoodMint — memecoin launchpad on Robinhood Chain (https://hoodmint.fun).
// Every token launches and trades on one singleton bonding-curve contract:
// HoodMintCurve 0x570e51c509a20C63C409A43Bc8d9e2aeA564B61b (deployed at block 15,675,879).
// https://robinhoodchain.blockscout.com/address/0x570e51c509a20C63C409A43Bc8d9e2aeA564B61b
//
// TVL = native ETH held by the curve contract: the real ETH reserves backing every
// open bonding curve. On graduation the raised ETH moves into a permanently locked
// Uniswap V3 position owned by the LpLocker (0x072E193e9B3487dDB2687F62D27774a05473a18c);
// that liquidity is counted by the Uniswap V3 adapter, so it is deliberately not
// counted here (avoids double counting).

const HOODMINT_CURVE = '0x570e51c509a20C63C409A43Bc8d9e2aeA564B61b'

module.exports = {
  methodology:
    'TVL is the native ETH held by the HoodMintCurve singleton — the real ETH reserves backing all open bonding curves (plus trade fees accrued but not yet claimed by creators/protocol). Liquidity of graduated tokens sits in permanently locked Uniswap V3 positions and is counted under Uniswap V3, not here.',
  start: 1784648205, // 2026-07-21, HoodMintCurve deployment (block 15675879)
  robinhood: {
    tvl: sumTokensExport({ owner: HOODMINT_CURVE, tokens: [ADDRESSES.null] }),
  },
}
