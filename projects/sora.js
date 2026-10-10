const { getStorageEntries, ScaleReader } = require('./helper/chain/substrate')

const XOR = '0x0200000000000000000000000000000000000000000000000000000000000000'

// PoolXYK.Reserves: double map (Blake2_128Concat base, Blake2_128Concat target) -> (baseReserve: u128, targetReserve: u128)
// every SORA asset uses 18 decimals
async function tvl(api) {
  const entries = await getStorageEntries('sora', { pallet: 'PoolXYK', item: 'Reserves' })
  const pools = entries.map(({ rest, value }) => {
    const key = Buffer.from(rest)
    const reader = new ScaleReader(value)
    return {
      base: '0x' + key.subarray(16, 48).toString('hex'),
      target: '0x' + key.subarray(64, 96).toString('hex'),
      baseReserve: Number(BigInt(reader.u128())) / 1e18,
      targetReserve: Number(BigInt(reader.u128())) / 1e18,
    }
  })

  // non-XOR base assets (XSTUSD, KUSD, TBCD) have no price feed and are depegged, so price them in XOR via their XOR pool
  const xorPrice = { [XOR]: 1 }
  for (const { base, target, baseReserve, targetReserve } of pools)
    if (base === XOR && targetReserve > 0) xorPrice[target] = baseReserve / targetReserve

  let xorTotal = 0
  for (const { base, baseReserve } of pools) {
    if (!xorPrice[base]) continue
    xorTotal += 2 * baseReserve * xorPrice[base]
  }
  api.addCGToken('sora-2', xorTotal)
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: "All XYK pools from https://polkaswap.io on SORA, read on-chain. Each pool is valued at twice its base-asset reserve; non-XOR base assets are priced in XOR through their XOR pool.",
  sora: { tvl },
};
