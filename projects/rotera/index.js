const RUSD_CONTRACT = '0x1e02170F28fa3752DF14151eCC36f1feC77800EA';

async function tvl(api) {
  const currentAdapter = await api.call({ abi: 'address:currentAdapter', target: RUSD_CONTRACT })
  const aToken = await api.call({ abi: 'address:aUSDC', target: currentAdapter })
  return api.sumTokens({ owner: currentAdapter, tokens: [aToken] })
}

module.exports = {
  methodology: 'TVL is calculated by fetching the total accumulated aUSDC balance (principal + Aave V3 yield) deployed through the active Rotera adapter.',
  start: '2026-04-17',
  base: { tvl }
};
