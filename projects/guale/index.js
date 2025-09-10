const VAULTS = [
  // GUALE-CLMUSDC_USDT
  "0x6a84f7ba493c4d6590696b782b0f0fb2588fbdc2",
  // GUALE-CLMWBTC_WETH
  "0xea89fd775cc0203b79a5cb5710d66a6145ea391d",
  // GUALE-CLMWETH_USDC
  "0x6077e51a48a1ee3f8fa975dc23041cf248b180c7",
].map(a => a.toLowerCase())

const abi = {
  // Returns the addresses of the two underlying tokens (token0, token1)
  wants: "function wants() view returns (address token0, address token1)",
  // Returns the total balances of those two tokens (amount0, amount1)
  // across the whole system (vault + strategy + positions)
  balances: "function balances() view returns (uint256 amount0, uint256 amount1)",
}

async function tvl(api) {
  // Call wants() and balances() on all vaults
  const wants = await api.multiCall({ abi: abi.wants, calls: VAULTS })
  const bals = await api.multiCall({ abi: abi.balances, calls: VAULTS })

  // Sum token0/token1 for each vault. DefiLlama helpers will convert to USD and handle decimals.
  for (let i = 0; i < VAULTS.length; i++) {
    const w = wants[i]
    const b = bals[i]

    // Support return values as arrays or named objects, depending on RPC/codec
    const t0 = (Array.isArray(w) ? w[0] : w.token0).toLowerCase()
    const t1 = (Array.isArray(w) ? w[1] : w.token1).toLowerCase()
    const a0 = Array.isArray(b) ? b[0] : b.amount0
    const a1 = Array.isArray(b) ? b[1] : b.amount1

    await api.add(t0, a0)
    await api.add(t1, a1)
  }
}

module.exports = {
  methodology:
    "Sum the underlying balances of each CLM vault by calling balances(), and obtain token addresses via wants(). This captures TVL including funds held in the strategy / concentrated position.",
  arbitrum: { tvl },
}  