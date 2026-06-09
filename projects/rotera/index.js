const RUSD_CONTRACT = '0x1e02170F28fa3752DF14151eCC36f1feC77800EA';
const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

async function tvl(api) {
  const currentAdapter = await api.call({
    abi: 'address:currentAdapter',
    target: RUSD_CONTRACT,
  });

  const totalBalance = await api.call({
    abi: 'function getTotalBalance() view returns (uint256)',
    target: currentAdapter,
  });

  api.add(USDC_CONTRACT, totalBalance);
}

module.exports = {
  methodology: 'TVL is calculated by fetching the total accumulated USDC balance (principal + Aave V3 yield) deployed through the active Rotera adapter.',
  start: 1776403140,
  base: {
    tvl,
  }
};
