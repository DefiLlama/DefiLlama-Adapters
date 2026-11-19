// Goo Exchange curated vaults on Robinhood Chain: each vault is the only liquidity provider of its own pool on a
// separate vault-pool factory (not the goo-exchange DEX factory), holds it as two Uniswap V3 positions and compounds
// arbitrage profit into them.
const VAULT_FACTORY = '0xB4FE65D4A7Fa5Fe40A58e78eF3B5eE34a0059643'

const abi = {
  vaultAt: 'function vaultAt(uint256) view returns (address)',
  // what the vault's holders own: both positions at the pool's price, what the pool owes the vault and its idle
  // tokens, less what payees are owed
  totals: 'function totals() view returns (uint256 total0, uint256 total1)',
}

async function tvl(api) {
  const vaults = await api.fetchList({ lengthAbi: 'uint256:vaultCount', itemAbi: abi.vaultAt, target: VAULT_FACTORY })
  const token0s = await api.multiCall({ abi: 'address:token0', calls: vaults })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: vaults })
  const totals = await api.multiCall({ abi: abi.totals, calls: vaults })
  totals.forEach(({ total0, total1 }, i) => {
    api.add(token0s[i], total0)
    api.add(token1s[i], total1)
  })
}

module.exports = {
  start: '2026-10-19',
  methodology: 'Counts what the holders of every Goo Exchange curated vault own: each vault\'s two Uniswap V3 positions at its pool\'s price, plus what the pool owes the vault and its idle tokens, less what payees are owed. Vaults are listed by the vault factory. Their pools sit on a separate factory from the Goo Exchange DEX, so this TVL is not part of the DEX\'s.',
  robinhood: { tvl },
}
