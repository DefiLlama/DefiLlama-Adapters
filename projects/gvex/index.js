const ADDRESSES = require('../helper/coreAssets.json')
const BigNumber = require('bignumber.js')

const VAULT_CONTRACT = '0xf172eCF8230fc4F2a5C6531690F91306d0079f53';

async function tvl(api) {
  // Fetch the raw native (GPU) balance for the vault contract
  const balances = await api.sumTokens({ owners: [VAULT_CONTRACT], tokens: [ADDRESSES.null] });

  // Construct the expected key (e.g. "gan:0x0000..."), and fallback to plain null address
  const nativeKey = `${api.chain}:${ADDRESSES.null}`;
  const raw = balances[nativeKey] || balances[ADDRESSES.null] || 0;
  if (!raw || Number(raw) === 0) return balances;

  // Convert raw wei-like amount to token amount (GPU has 18 decimals)
  const amount = new BigNumber(raw).dividedBy(new BigNumber(10).pow(18)).toString();
  const amountNumber = Number(amount);

  // Add the token under the CoinGecko key so we can fetch the USD price in tests
  api.add('coingecko:gpunet', amountNumber, { skipChain: true });

  // Return balances as normal (the tvl testing harness will use the coingecko entry for pricing)
  return api.getBalances();
}

module.exports = {
  methodology: 'Counts the total native GPU tokens deposited in the GPUVault contract.',
  start: 4430679,
  gan: {
    tvl,
  }
};
