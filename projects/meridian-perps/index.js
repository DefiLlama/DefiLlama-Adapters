const ADDRESSES = require('../helper/coreAssets.json')
const { getCuratorTvlAccountableVault } = require('../helper/curators')
const BigNumber = require('bignumber.js')

const LP_VAULT = '0x24b84023c8e4Da635be228C380C09bfE5271BF9d' // Meridian LP vault (ERC-4626)
const LP_VAULT_ACCOUNT = '0x2f46C3FCe6BdA596c2771BCA618C4f69aE3E56B2' // exchange account the LP vault trades from
const LP_VAULT_SUBACCOUNT = '0x7072696d61727900000000000000000000000000000000000000000000000000' // bytes32("primary")
const EXCHANGE = '0xD540F47F214dC7D6D244E62A6aE7e06B586Ef44A' // Meridian ExchangeGateway proxy
const MER_USD = '0xad221259d4a1f2d7376dc1012c561bc86640f009' // merUSD, exchange collateral, 1:1 backed by USDe held in the merUSD contract

// exchange account balances are 9 decimals, merUSD is 18
const EXCHANGE_BALANCE_SCALE = 1e9

const abi = {
  getExchangeTokens: 'function getExchangeTokens() view returns (bytes32[])',
  getToken: 'function getToken(bytes32 tokenName) view returns (tuple(bytes32 name, address tokenAddress, bool depositEnabled, bool withdrawEnabled, bool removeProtected, uint256 depositCapacity, uint256 minDeposit, uint128 withdrawFee, uint128 depositFee, address oftAddress, address backingToken))',
  getAccountBalance: 'function getAccountBalance(address account, bytes32 subaccount, address token) view returns (uint256)',
}

// Sum of the LP vault account's exchange balances. Every balance token is either merUSD or a
// USD-equivalent backed by it (XAUUSD, SPYUSD, ...), so amounts are additive.
async function getVaultAccountUsdBalance(api) {
  const names = await api.call({ abi: abi.getExchangeTokens, target: EXCHANGE })
  const tokens = await api.multiCall({ abi: abi.getToken, target: EXCHANGE, calls: names })
  const usdTokens = tokens
    .filter(t => t.tokenAddress.toLowerCase() === MER_USD || t.backingToken.toLowerCase() === MER_USD)
    .map(t => t.tokenAddress)
  const balances = await api.multiCall({
    abi: abi.getAccountBalance,
    target: EXCHANGE,
    calls: usdTokens.map(token => ({ params: [LP_VAULT_ACCOUNT, LP_VAULT_SUBACCOUNT, token] })),
  })
  return balances.reduce((sum, b) => sum.plus(b), new BigNumber(0)).times(EXCHANGE_BALANCE_SCALE)
}

async function tvl(api) {
  await getCuratorTvlAccountableVault(api, [LP_VAULT])

  const [exchangeBalance, vaultUsd] = await Promise.all([
    api.call({ abi: 'erc20:balanceOf', target: MER_USD, params: EXCHANGE }),
    getVaultAccountUsdBalance(api),
  ])
  api.add(ADDRESSES.robinhood.USDe, new BigNumber(exchangeBalance).minus(vaultUsd).toFixed(0))
}

module.exports = {
  methodology: 'Sum of the LP vault NAV (convertToAssets(totalSupply) of the ERC-4626 vault) and user collateral held by the Meridian exchange contract (merUSD, counted as the USDe backing it). The LP vault\'s own exchange balances are excluded to avoid double counting.',
  start: '2026-07-01',
  robinhood: { tvl },
}
