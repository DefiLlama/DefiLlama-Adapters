// Homa (liquid staking) TVL read straight from chain storage over HTTP JSON-RPC
const { getStorage, getStorageEntries, decodeUint, decodeCompact } = require('../chain/substrate')

const config = {
  acala: { token: 'polkadot', decimals: 10 },
  karura: { token: 'kusama', decimals: 12 },
}

// Homa.ToBondPool: Balance (u128) + sum of Homa.StakingLedgers[*].bonded (Compact<Balance>, first field)
async function getTotalStaking(chain) {
  const toBond = decodeUint(await getStorage(chain, { pallet: 'Homa', item: 'ToBondPool' }))
  const ledgers = await getStorageEntries(chain, { pallet: 'Homa', item: 'StakingLedgers' })
  const bonded = ledgers.reduce((sum, { value }) => sum + decodeCompact(value).value, 0n)
  return toBond + bonded
}

async function staking(chain) {
  const { token, decimals } = config[chain]
  const total = await getTotalStaking(chain)
  return { [token]: Number(total) / 10 ** decimals }
}

module.exports = {
  staking,
  getTotalStaking,
}
