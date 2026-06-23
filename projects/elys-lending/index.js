const { get } = require('../helper/http')

async function tvl(api) {
  const { vault_tokens } = await get('https://api.elys.network/elys-network/elys/masterchef/chain_tvl')
  const vaultUsdc = vault_tokens.find(i => i.denom === 'USDC')?.amount || 0
  api.addCGToken('usd-coin', vaultUsdc)
}


async function borrowed(api) {
  const { net_stakings, vault_tokens } = await get('https://api.elys.network/elys-network/elys/masterchef/chain_tvl')
  const vaultUsdc = vault_tokens.find(i => i.denom === 'USDC')?.amount || 0
  const netUsdc = net_stakings.find(i => i.denom === 'USDC')?.amount || 0
  api.addCGToken('usd-coin', vaultUsdc - netUsdc)
}


module.exports = {
  timetravel: false,
  elys: { tvl, borrowed, }
}