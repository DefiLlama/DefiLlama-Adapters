const VAULT_CONTRACT = '0xa21eAFee50DA331521B6Ec4Dd33dEd3F9E1bD2Ea';
const USDT0_CONTRACT = '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb';

async function tvl(api) {
  const totalAssets = await api.call({
    abi: 'uint256:totalAssets',
    target: VAULT_CONTRACT,
  });

  api.add(USDT0_CONTRACT, totalAssets);
}

module.exports = {
  methodology: 'Counts the total USDT0 managed by the Tulpea vault on MegaETH, including funds deployed into strategies, via the ERC4626 totalAssets() function.',
  start: 12861020,
  megaeth: {
    tvl,
  },
};
