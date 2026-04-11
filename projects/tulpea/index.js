const VAULT_CONTRACT = '0xa21eAFee50DA331521B6Ec4Dd33dEd3F9E1bD2Ea';
const USDT0_CONTRACT = '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb';

async function tvl(api) {
  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: USDT0_CONTRACT,
    params: [VAULT_CONTRACT],
  });

  api.add(USDT0_CONTRACT, balance);
}

module.exports = {
  methodology: 'Counts the USDT0 held in the Tulpea vault contract on MegaETH.',
  start: 12861020,
  megaeth: {
    tvl,
  },
};
