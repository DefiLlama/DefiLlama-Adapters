const { addHypercoreBalances } = require('../helper/chain/hyperliquid')

// NuWealth.ai's public Hyperliquid (HyperCore) user vaults
const VAULTS = [
  '0xd321ad79041bdad719ba5ff42fe950e1977df439', // Agent RockSteady
]

async function tvl(api) {
  await addHypercoreBalances({ api, owners: VAULTS })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'TVL is the account value of NuWealth.ai\'s Hyperliquid vaults on HyperCore: perp margin equity in USDC plus any spot balances, read from Hyperliquid\'s info API. It includes every depositor\'s share and the vault leader\'s own share.',
  hyperliquid: { tvl },
}
