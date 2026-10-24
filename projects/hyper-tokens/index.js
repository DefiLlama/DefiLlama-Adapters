// Hyper Tokens (hypertokens.io): USDC liquidity pools (ProjectX v3, 1% fee) for
// Ensemble's ERC-4626 tokens on HyperEVM. Vault shares held by the pools are
// valued at their underlying asset via convertToAssets.
const USDC = '0xb88339CB7199b77E23DB6E890353E22632Ba630f'

const pools = [
  '0x27afEfbBD3F41b7C8e18736c22987B49FCEc1a27', // BULL/USDC
  '0x42601C310fAB67C5f04256c43eFAF3b324D70037', // iBULL/USDC
  '0xBE848E1Ac8015460C3D7BA034772e191AbCd0B1e', // BEAR/USDC
  '0x6E521A50aDd32891Af4D26973f1d8d2b20D5043d', // iBEAR/USDC
  '0x8e26Ebc3ac380FF931c6f6731c9289514e62EC21', // VOL/USDC
  '0x96A1ef14E88553ab750e166233798E9Ec3a6FD97', // iVOL/USDC
]

async function tvl(api) {
  const token0s = await api.multiCall({ abi: 'address:token0', calls: pools })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: pools })
  const vaults = pools.map((_, i) => token0s[i].toLowerCase() === USDC.toLowerCase() ? token1s[i] : token0s[i])

  const usdcBals = await api.multiCall({ abi: 'erc20:balanceOf', calls: pools.map(p => ({ target: USDC, params: [p] })) })
  usdcBals.forEach(b => api.add(USDC, b))

  const shareBals = await api.multiCall({ abi: 'erc20:balanceOf', calls: pools.map((p, i) => ({ target: vaults[i], params: [p] })) })
  const assets = await api.multiCall({ abi: 'address:asset', calls: vaults })
  const underlying = await api.multiCall({ abi: 'function convertToAssets(uint256) view returns (uint256)', calls: vaults.map((v, i) => ({ target: v, params: [shareBals[i]] })) })
  underlying.forEach((amt, i) => api.add(assets[i], amt))
}

module.exports = {
  methodology: 'TVL is the USDC plus Ensemble ERC-4626 vault shares (valued at their underlying asset via convertToAssets) held in the six Hyper Tokens ProjectX v3 pools on HyperEVM.',
  hyperliquid: { tvl },
}
