const sdk = require('@defillama/sdk');
const TWT_STAKE_CONTRACT = '0x5e7c3c55eb5c0ee10817d70e414f4b1ee22d5ce3';
const TWT_TOKEN_CONTRACT = '0x4b0f1812e5df2a09796481ff14017e6005508003';

async function tvl(_, _1, _2, { api }) {
  const balances = {};

  const contractBalance = await api.call({
    abi: 'contract:getContractBalance',
    target: TWT_STAKE_CONTRACT,
    params: [],
  });

  await sdk.util.sumSingleBalance(balances, TWT_TOKEN_CONTRACT, contractBalance, api.chain)

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Counts the number of TWT tokens in the TWT Stake contract.',
  start: 1000235,
  bsc: {
    tvl,
  }
};