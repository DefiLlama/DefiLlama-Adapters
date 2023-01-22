const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs')

const LUSD = '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0';
const YEARN_VAULT = '0x4fe4bf4166744bcbc13c19d959722ed4540d3f6a';
const YERAN_STRATEGY = '0x9043268b2e280de7df8aafe7feb86e553bd90fdd';
const LIQUITY_VAULT = '0x91a6194f1278f6cf25ae51b604029075695a74e5';
const LIQUITY_STRATEGY = '0x537ee18ca78c42e1e7fb87fecfe9fc811c3d3575';

const vaults = [YEARN_VAULT, LIQUITY_VAULT];
const strategies = [YERAN_STRATEGY, LIQUITY_STRATEGY];

async function tvl(_, _b, _cb, { api, chain, block, }) {
  const balances = {}
  const strategyBalances = await api.multiCall({
    abi: 'uint256:investedAssets',
    calls: strategies,
  })
  strategyBalances.forEach(i => sdk.util.sumSingleBalance(balances, LUSD, i, chain))
  return sumTokens2({ balances, chain, block, tokens: [LUSD], owners: vaults, })
}

module.exports = {
  misrepresentedTokens: false,
  methodology: 'add underlying asset balances in all the vaults and strategies together.',
  doublecounted: true,
  start: 15308000, // The first vault YEARN_VAULT was deployed
  ethereum: {
    tvl,
  }
};