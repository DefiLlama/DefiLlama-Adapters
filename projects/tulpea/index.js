const VAULT_CONTRACT = '0xa21eAFee50DA331521B6Ec4Dd33dEd3F9E1bD2Ea';
const USDT0_CONTRACT = '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb';

/**
 * Computes the TVL of Tulpea's TulpeaYieldVault on MegaETH.
 * The vault is ERC4626 + ERC-7540 (async redemption) and holds USDT0,
 * routing funds through registered strategies (AvonStrategy, RealEstateStrategy).
 * totalAssets() sums the vault's idle USDT0 balance plus each registered
 * strategy's reported totalAssets(), tracked via totalDebt and updated
 * instantly on processReport(strategy).
 * @param {object} api - DefiLlama ChainApi instance
 */
async function tvl(api) {
  const totalAssets = await api.call({
    abi: 'uint256:totalAssets',
    target: VAULT_CONTRACT,
  });

  api.add(USDT0_CONTRACT, totalAssets);
}

module.exports = {
  methodology: 'Calls totalAssets() on the TulpeaYieldVault (ERC4626 + ERC-7540) on MegaETH, which sums idle USDT0 in the vault plus each registered strategy\'s (AvonStrategy, RealEstateStrategy) totalAssets(), tracked via totalDebt and updated on processReport().',
  start: 12861020,
  megaeth: {
    tvl,
  },
};
