const axios = require('axios');
const { BigNumber } = require('bignumber.js');
const { transformBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk');

async function getVaultBalances(vaultAddress) {
  const vaultBalances = `https://sentry.exchange.grpc-web.injective.network/api/exchange/portfolio/v2/portfolio/${vaultAddress}/balances`;
  try {
    const response = await axios.get(vaultBalances);
    const subaccounts = response.data.portfolio.subaccounts;
    return subaccounts.reduce((balances, account) => {
      const balance = new BigNumber(account.deposit.availableBalance);
      const existingBalance = balances[account.denom] ? new BigNumber(balances[account.denom]) : new BigNumber(0);
      balances[account.denom] = existingBalance.plus(balance).toFixed(0);
      return balances;
    }, {});
  } catch (error) {
    console.error('Error fetching vault balances', error);
    return {};
  }
}


async function getVaultsTvl() {
  const MASTER_VAULT_ADDRESS = 'inj1vcqkkvqs7prqu70dpddfj7kqeqfdz5gg662qs3';
  const vaultBalances = await getVaultBalances(MASTER_VAULT_ADDRESS);
  const aggregatedBalances = Object.keys(vaultBalances).reduce((totalBalances, denom) => {
    sdk.util.sumSingleBalance(totalBalances, denom, vaultBalances[denom]);
    return totalBalances;
  }, {});

  return transformBalances('injective', aggregatedBalances);
}

module.exports = {
  timetravel: false,
  methodology: 'TVL accounts for the liquidity locked up in the Injective protocol vaults that is not being used towards posting orders to orderbook. The data comes back from the Injective API.',
  injective: {
    tvl: () => getVaultsTvl()
  }
}
