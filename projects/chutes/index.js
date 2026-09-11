const { getStorage, subtensorPrefix, u16le, hexToBuf, u64LE } = require('../helper/chain/bittensor')

const CHUTES_NETUID = 64

// SubtensorModule.SubnetTAO is keyed by netuid (u16, Identity hasher), so the full key
// is prefix ++ netuid as little-endian u16. Value is u64 RAO (1 TAO = 1e9 RAO).
const subnetTaoKey = (netuid) => Buffer.concat([subtensorPrefix('SubnetTAO'), u16le(netuid)])

async function readU64(key) {
  const value = await getStorage(key)
  if (value == null) return 0 // key unset
  const buf = hexToBuf(value)
  if (buf.length !== 8) throw new Error(`expected u64 (8 bytes), got ${buf.length}`)
  return Number(u64LE(buf))
}

/** Only track TAO side of subnet AMM: https://docs.learnbittensor.org/subnets/understanding-subnets#liquidity-pools */
async function tvl(api) {
  const taoIn = await readU64(subnetTaoKey(CHUTES_NETUID))
  api.addCGToken('bittensor', taoIn / 1e9)
}

module.exports = {
  timetravel: false,
  methodology: 'Counts the TAO reserves of the Chutes (netuid 64) dTAO liquidity pool, read from SubtensorModule.SubnetTAO on public chain RPC.',
  bittensor: { tvl },
}
