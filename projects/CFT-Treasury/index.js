const TronWeb = require('tronweb');
const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport, nullAddress } = require('../helper/sumTokens');

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io', // Use a reliable Tron node
});

async function fetchFrozenTRX(owner) {
  const account = await tronWeb.trx.getAccount(owner);
  let frozenBalance = 0;

  // Add frozen TRX balances from `account.frozen` if available
  if (account.frozen && account.frozen.balances) {
    frozenBalance += account.frozen.balances.reduce(
      (sum, freeze) => sum + freeze.amount,
      0
    );
  }

  // Add frozen TRX balances from `account.account_resource` if available
  if (account.account_resource) {
    if (account.account_resource.frozen_balance_for_energy) {
      frozenBalance += account.account_resource.frozen_balance_for_energy.frozen_balance || 0;
    }
  }

  return frozenBalance;
}

module.exports = {
  tron: {
    tvl: async () => {
      const frozenTRX = await fetchFrozenTRX('TFvHNqDqttkXSS8ZTdC4c4W7q97SFW3iKq');
      const tokenBalances = await sumTokensExport({
        tokensAndOwners: [
          [nullAddress, 'TFvHNqDqttkXSS8ZTdC4c4W7q97SFW3iKq'],
          [ADDRESSES.tron.JST, 'TFvHNqDqttkXSS8ZTdC4c4W7q97SFW3iKq'],
          [ADDRESSES.tron.SUN, 'TFvHNqDqttkXSS8ZTdC4c4W7q97SFW3iKq'],
          [ADDRESSES.tron.JM, 'TFvHNqDqttkXSS8ZTdC4c4W7q97SFW3iKq'],
        ]
      })();

      // Add frozen TRX to the TVL calculation
      tokenBalances[nullAddress] = (tokenBalances[nullAddress] || 0) + frozenTRX;

      return tokenBalances;
    },
  },
};
