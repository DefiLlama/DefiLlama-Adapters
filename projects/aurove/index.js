const ADDRESSES = require('../helper/coreAssets.json')

// Aurove AssetLedger (ERC-1155) — canonical claim supply for managed products
const LEDGER = '0x0AF3601f0E15b8E33fEc660fBE515DDb6C54dD3c'

// Production managed-tranche ids: (variant << 16) | epochs
// veBTC managed sentinel: variant=1, epochs=4 → 65540
// veMEZO managed sentinel: variant=2, epochs=208 → 131280
const AVBTCM_TRANCHE_ID = 65540
const AVMEZOM_TRANCHE_ID = 131280

async function tvl(api) {
  const [btcSupply, mezoSupply] = await api.multiCall({
    abi: 'function totalSupply(uint256) view returns (uint256)',
    calls: [
      { target: LEDGER, params: [AVBTCM_TRANCHE_ID] },
      { target: LEDGER, params: [AVMEZOM_TRANCHE_ID] },
    ],
  })

  // Shares are minted 1:1 with locked underlying (18 decimals on Mezo).
  api.add(ADDRESSES.mezo.BTC, btcSupply)
  api.add(ADDRESSES.mezo.MEZO, mezoSupply)
}

module.exports = {
  methodology:
    'TVL counts Aurove Ledger ERC-1155 totalSupply for the managed avBTCm (tranche 65540) and avMEZOm (tranche 131280) products as the underlying locked on Mezo (native BTC and MEZO). Share minting is 1:1 with locked underlying, but liquid-token market prices are separate: avBTCm trades vs MUSD, and avMEZOm prices through avBTCm → MUSD. Marked doublecounted because the same underlying is already included in Mezo Earn (veBTC/veMEZO). Concentrated-liquidity pool balances for MUSD/avBTCm and avBTCm/avMEZOm are tracked under Tigris Mezo V3, not here.',
  doublecounted: true,
  mezo: { tvl },
}
