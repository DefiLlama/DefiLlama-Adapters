const { get } = require('../helper/http')

async function getVaultBalances(vaultAddress, api) {
  const vaultBalances = `https://sentry.exchange.grpc-web.injective.network/api/exchange/portfolio/v2/portfolio/${vaultAddress}/balances`;
  const response = await get(vaultBalances);
  const subaccounts = response.portfolio.subaccounts;
  return subaccounts.map(i => api.add(i.denom, +i.deposit.availableBalance))
}

async function tvl(api) {
  const MASTER_VAULT_ADDRESS = 'inj1vcqkkvqs7prqu70dpddfj7kqeqfdz5gg662qs3';
  await getVaultBalances(MASTER_VAULT_ADDRESS, api);
}

module.exports = {
  timetravel: false,
  methodology: 'TVL accounts for the liquidity locked up in the Injective protocol vaults that is not being used towards posting orders to orderbook. The data comes back from the Injective API.',
  injective: { tvl }
}
