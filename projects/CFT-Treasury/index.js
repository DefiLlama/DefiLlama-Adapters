const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport, nullAddress } = require('../helper/sumTokens');
const { get, post } = require('../helper/http'); // Assuming these are available

// Function to get staked TRX by account
async function getStakedTron(account) {
  const data = await get(`https://apilist.tronscan.org/api/vote?candidate=${account}`);
  return data.totalVotes ?? 0;
}

// Function to get TRX balance (unstaked + frozen balance)
async function getTrxBalance(account) {
  const data = await post('https://api.trongrid.io/wallet/getaccount', {
    address: account,
    visible: true,
  });
  return data.balance + (data.frozen?.reduce((t, { frozen_balance }) => t + frozen_balance, 0) ?? 0);
}

// Wrapper function to calculate total balance (staked + unstaked)
async function getTotalTron(account) {
  const staked = await getStakedTron(account);
  const unstaked = await getTrxBalance(account);
  return staked + unstaked;
}

module.exports = {
  tron: {
    tvl: async () => {
      // Unstaked balance
      const unstakedTvl = await sumTokensExport({
        tokensAndOwners: [
          [nullAddress, 'TFvHNqDqttkXSS8ZTdC4c4W7q97SFW3iKq'],
        ],
      });

      // Staked balance for the same account
      const account = 'TFvHNqDqttkXSS8ZTdC4c4W7q97SFW3iKq';
      const stakedBalance = await getTotalTron(account);

      // Combine staked and unstaked balances
      const totalTvl = {
        ...unstakedTvl,
        [`tron:${nullAddress}`]: (unstakedTvl[`tron:${nullAddress}`] ?? 0) + stakedBalance,
      };

      return totalTvl;
    },
  },
};
