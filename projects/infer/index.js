// INFER (imdUSD): a CDP stablecoin on Ethereum. Borrowers lock sIMD (StakedIMD, an ERC-4626 over IMD) in the vault
// and mint imdUSD against it. TVL is that collateral, valued as the IMD it redeems for.
const VAULT = '0x0b69F8DA8D8cE521d74Ea69a7A3475B77302EF82' // imdUSD CDP vault (ParameterizedVault)
const SIMD = '0x9Efa934D9fAd4AE28c998a40195646b965a97247' // StakedIMD (sIMD), 24 decimals
const IMD = '0xD34a99Bc0f67aE1bbd63C660e6d0b0dd03E263B7' // IMD, 18 decimals

/**
 * Collateral locked in the imdUSD vault: its sIMD balance, converted to the IMD it redeems for.
 * @param {import('@defillama/sdk').ChainApi} api
 */
async function tvl(api) {
  const shares = await api.call({ target: SIMD, abi: 'erc20:balanceOf', params: [VAULT] })
  // sIMD has 24 decimals and IMD 18, so shares are converted to IMD with the vault's own rate, never 1:1.
  const imd = await api.call({ target: SIMD, abi: 'function convertToAssets(uint256) view returns (uint256)', params: [shares] })
  api.add(IMD, imd)
}

module.exports = {
  methodology: 'TVL is the sIMD collateral locked in the imdUSD vault by borrowers, counted as the IMD it converts to (StakedIMD convertToAssets). Minted imdUSD and the Treasury\'s holdings are not counted.',
  start: '2026-10-11',
  ethereum: { tvl },
}
