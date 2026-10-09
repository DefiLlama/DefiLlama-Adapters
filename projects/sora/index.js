const { getStorageEntries, ScaleReader } = require('../helper/chain/substrate')

const cgMapping = {
  '0x0200000000000000000000000000000000000000000000000000000000000000': 'sora',
  '0x0200040000000000000000000000000000000000000000000000000000000000': 'sora-validator-token',
  '0x0200050000000000000000000000000000000000000000000000000000000000': 'polkaswap',
  '0x0200060000000000000000000000000000000000000000000000000000000000': 'dai',
  '0x0200070000000000000000000000000000000000000000000000000000000000': 'ethereum',
}

const DECIMALS = 18

// PoolXYK.Reserves: double map Blake2_128Concat AssetId32, Blake2_128Concat AssetId32 => (Balance, Balance)
async function tvl(api) {
  const entries = await getStorageEntries('sora', { pallet: 'PoolXYK', item: 'Reserves' })

  for (const { rest, value } of entries) {
    const key = new ScaleReader(rest)
    key.bytes(16)
    const baseId = '0x' + key.bytes(32).toString('hex')
    key.bytes(16)
    const targetId = '0x' + key.bytes(32).toString('hex')
    const reserves = new ScaleReader(value)
    const baseReserve = reserves.u128()
    const targetReserve = reserves.u128()

    if (cgMapping[baseId]) {
      const amount = Number(baseReserve) * 2 / (10 ** DECIMALS)
      if (amount > 0) api.add(cgMapping[baseId], amount, { skipChain: true })
    } else if (cgMapping[targetId]) {
      const amount = Number(targetReserve) * 2 / (10 ** DECIMALS)
      if (amount > 0) api.add(cgMapping[targetId], amount, { skipChain: true })
    }
  }

  return api.getBalances()
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: "TVL is computed from on-chain pool reserves on the SORA network (poolXYK pallet).",
  sora: { tvl },
}
