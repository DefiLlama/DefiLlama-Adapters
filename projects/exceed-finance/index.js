const { PublicKey } = require('@solana/web3.js')
const { getConnection } = require('../helper/solana')

// Exceed Finance yield-bearing tokens, issued by the Exceed liquid program
// par1tyqusak2f2DXg9RHv78SVHNWXkJLSbtJZQSuWjV. Each pair account stores the
// base token, the receipt token mint and the on-chain exchange rate schedule.
const PAIRS = [
  'EwqMpnBHKEd537E37kcsNU9Qi82uukjVAXsC8K5Kswt7', // exUSDC (base: USDC)
  'HwsGQqoXwQjGg5CDojLTipmeYFSmovoHtk7ZFtgrxSop', // exSOL  (base: SOL)
  'GpV9U2yY3L5u4DkWC6Unejsz42iNME4Usk5RzTaA23to', // exBTC  (base: cbBTC)
]

const PRECISION = 10n ** 12n

function decodePair(data) {
  let o = 8 // anchor discriminator
  o += 2 // pair bump, lst mint bump
  const baseMint = new PublicKey(data.subarray(o, o + 32)).toBase58(); o += 32
  const baseDecimals = data[o]; o += 1
  const lstMint = new PublicKey(data.subarray(o, o + 32)).toBase58(); o += 32
  const lstDecimals = data[o]; o += 1
  const symbolLength = data.readUInt32LE(o); o += 4 + symbolLength
  const intervalRate = data.readBigUInt64LE(o); o += 8
  const secondsPerInterval = BigInt(data.readInt32LE(o)); o += 4
  o += 8 // initial exchange rate
  const lastRate = data.readBigUInt64LE(o); o += 8
  const lastTimestamp = data.readBigInt64LE(o)
  return { baseMint, baseDecimals, lstMint, lstDecimals, intervalRate, secondsPerInterval, lastRate, lastTimestamp }
}

// Same schedule as the program: compounding per full interval, linear within the current one.
function exchangeRate({ intervalRate, secondsPerInterval, lastRate, lastTimestamp }, now) {
  const elapsed = now - lastTimestamp
  if (elapsed <= 0n) return lastRate
  let periods = elapsed / secondsPerInterval
  const remainder = elapsed % secondsPerInterval
  let compounded = PRECISION
  let factor = intervalRate
  while (periods > 0n) {
    if (periods & 1n) compounded = compounded * factor / PRECISION
    factor = factor * factor / PRECISION
    periods >>= 1n
  }
  const linear = (intervalRate - PRECISION) * remainder / secondsPerInterval
  return lastRate * (compounded + linear) / PRECISION
}

async function tvl(api) {
  const connection = getConnection()
  const infos = await connection.getMultipleAccountsInfo(PAIRS.map((p) => new PublicKey(p)))
  const now = BigInt(api.timestamp ?? Math.floor(Date.now() / 1000))
  infos.forEach((info, i) => {
    if (!info) throw new Error(`Exceed pair account ${PAIRS[i]} not found`)
  })
  for (const info of infos) {
    const pair = decodePair(info.data)
    const { value } = await connection.getTokenSupply(new PublicKey(pair.lstMint))
    const rate = exchangeRate(pair, now)
    let baseAmount = BigInt(value.amount) * rate / PRECISION
    const decimalGap = pair.baseDecimals - pair.lstDecimals
    if (decimalGap > 0) baseAmount *= 10n ** BigInt(decimalGap)
    if (decimalGap < 0) baseAmount /= 10n ** BigInt(-decimalGap)
    api.add(pair.baseMint, baseAmount.toString())
  }
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  doublecounted: true,
  methodology: 'TVL is the value of all outstanding exUSDC, exSOL and exBTC, read from chain: the supply of each receipt token multiplied by its on-chain exchange rate, expressed in the base token (USDC, SOL, cbBTC). The deposits are deployed into lending markets such as Kamino and Jupiter Lend, so the TVL is marked as double counted.',
  solana: { tvl },
}
