const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { getLogs } = require('../helper/cache/getLogs')
const { getConnection } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

// Ferzan Factory (https://ferzan-factory.com) is a multi-chain launchpad. Every coin starts on its own
// bonding curve; when the curve fills it graduates and its liquidity moves to a DEX pool (Meteora,
// PancakeSwap, Uniswap, SunSwap), where the DEX adapter counts it. TVL here is only the native coin
// raised by curves that have not graduated yet. The launched coins themselves are never counted.
// Contract list: https://ferzan-factory.com/verify

// EVM + Tron: one curve contract per coin, created by a Ferzan factory that emits
// CurveLaunched(curve, token, creator). Every curve version exposes realEth() (native raised, net of
// fees) and graduated(). realEth is zeroed when a curve graduates; graduated is checked as well.
const CURVE_LAUNCHED = 'event CurveLaunched(address indexed curve, address indexed token, address indexed creator)'

// Every factory that has created Ferzan curves, and a block before the first Ferzan launch on each chain
// (Ethereum and Tron have no launches yet, so theirs is an earlier block). Base and Arc each have one
// coin on an earlier factory.
const EVM = {
  bsc: { factories: ['0xe8ca8382ab3ab55ffb310fb55da988fb83c922bd'], fromBlock: 125534029 },
  base: { factories: ['0x10b1c446ff600dfc4dd9218a364bdbaf93a0fea2', '0xb56b4184dbb5bc5c67168ae3a4960e69392118de'], fromBlock: 51753098 },
  ethereum: { factories: ['0xb56b4184dbb5bc5c67168ae3a4960e69392118de'], fromBlock: 25500000 },
  robinhood: { factories: ['0xb56b4184dbb5bc5c67168ae3a4960e69392118de'], fromBlock: 83665562, native: ADDRESSES.robinhood.WETH },
  // Arc pays gas in USDC: the curve holds native USDC (18 decimals), which is the same balance as the
  // 6-decimal USDC ERC-20 at 0x3600...0000, so it is added as that token.
  arc: { factories: ['0xe8ca8382ab3ab55ffb310fb55da988fb83c922bd', '0xb56b4184dbb5bc5c67168ae3a4960e69392118de'], fromBlock: 22900614, native: ADDRESSES.arc.USDC, nativeDiv: 10n ** 12n },
  // 0 TRX factory (current) and the earlier 5 TRX factory
  tron: { factories: ['TSxKr97AGGL6nEZNFYRnGfN48VjB9fi5AN', 'TPS1aM5TwfmJHjzuA1XMy6wWme2LYqZ1BN'], fromBlock: 82000000 },
}

/**
 * EVM + Tron TVL: finds every Ferzan curve from the factories' CurveLaunched logs and adds the native coin
 * each one has raised (realEth) while it has not graduated.
 * @param {object} api DefiLlama ChainApi for the chain being measured
 */
async function evmTvl(api) {
  const { factories, fromBlock, native, nativeDiv = 1n } = EVM[api.chain]
  const curves = []
  for (const factory of factories) {
    const target = api.chain === 'tron' ? sdk.tron.hexifyTarget(factory) : factory
    const logs = await getLogs({ api, target, eventAbi: CURVE_LAUNCHED, onlyArgs: true, fromBlock })
    curves.push(...logs.map((l) => l.curve))
  }
  if (!curves.length) return
  const [raised, graduated] = await Promise.all([
    api.multiCall({ abi: 'uint256:realEth', calls: curves, permitFailure: true }),
    api.multiCall({ abi: 'bool:graduated', calls: curves, permitFailure: true }),
  ])
  raised.forEach((amount, i) => {
    if (amount == null || graduated[i] !== false) return
    const value = BigInt(amount) / nativeDiv
    if (native) api.add(native, value.toString())
    else api.addGasToken(value.toString())
  })
}

// Solana, Meteora Dynamic Bonding Curve: Ferzan coins are VirtualPool accounts whose `config` is one
// of Ferzan's partner configs (quote mint wSOL). Same layout and offsets as projects/archade.
const DBC_PROGRAM = new PublicKey('dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN')
const FERZAN_DBC_CONFIGS = [
  'AKNBSkUsVx2du7tJyuGzyC6ECFHP5fH69v8ntaFDYZLW', // community launches (current)
  'Gm9qwDLZbmQN19PubFK5vvfCpqF68voyYL8FHaLtfEky', // community launches (earlier)
  '8YoqjUBsyfgQv5s7fWR5nyjeMd43rKvMUEexAuYRCvbo', // FERZAN flagship
]
const VIRTUAL_POOL_SIZE = 424
const VIRTUAL_POOL_DISCRIMINATOR = Buffer.from([213, 224, 5, 209, 98, 69, 119, 92])
const CONFIG_OFFSET = 72
const QUOTE_RESERVE_OFFSET = 240 // u64, wSOL backing the curve
const IS_MIGRATED_OFFSET = 305 // u8, 1 = moved to a DAMM pool

// Solana, Ferzan's own curve program (site launches before the Meteora switch). State account is
// 172 bytes: byte 0 = 1 (initialised), real_sol u64 at 137, status u8 at 161: 0 = trading, 1 = full (buys stop,
// waiting for migrate), 2 = pooled on Raydium. A status 1 curve still holds its SOL in the program until migrate moves
// it to the pool (and zeroes real_sol), so it is counted; the Tron curves' `complete` state is handled the same way.
// Source: https://github.com/donwonfosho/ferzan-factory/blob/main/contracts/solana/ferzan-curve/src/lib.rs
const FERZAN_PROGRAM = new PublicKey('G7n5XBB7pjvKS7JfC6esgQGGAyPku5cposdiHfVAUxnJ')
const STATE_LEN = 172
const REAL_SOL_OFFSET = 137
const STATUS_OFFSET = 161

/**
 * Solana TVL: wSOL backing Ferzan's Meteora DBC curves that have not migrated, plus SOL held by curves of
 * Ferzan's own curve program that have not been pooled yet.
 * @param {object} api DefiLlama ChainApi for Solana
 */
async function solanaTvl(api) {
  const connection = getConnection()
  for (const config of FERZAN_DBC_CONFIGS) {
    const accounts = await connection.getProgramAccounts(DBC_PROGRAM, {
      dataSlice: { offset: 0, length: IS_MIGRATED_OFFSET + 1 },
      filters: [{ dataSize: VIRTUAL_POOL_SIZE }, { memcmp: { offset: CONFIG_OFFSET, bytes: config } }],
    })
    for (const { account: { data } } of accounts) {
      if (!data.subarray(0, 8).equals(VIRTUAL_POOL_DISCRIMINATOR)) continue
      if (data.readUInt8(IS_MIGRATED_OFFSET) !== 0) continue
      api.add(ADDRESSES.solana.SOL, data.readBigUInt64LE(QUOTE_RESERVE_OFFSET).toString())
    }
  }
  const curves = await connection.getProgramAccounts(FERZAN_PROGRAM, {
    dataSlice: { offset: 0, length: STATUS_OFFSET + 1 },
    filters: [{ dataSize: STATE_LEN }],
  })
  for (const { account: { data } } of curves) {
    if (data.readUInt8(0) !== 1 || data.readUInt8(STATUS_OFFSET) === 2) continue
    api.add(ADDRESSES.solana.SOL, data.readBigUInt64LE(REAL_SOL_OFFSET).toString())
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'Native coin (SOL, BNB, ETH, TRX, USDC on Arc) raised by Ferzan bonding curves that have not graduated yet, read from each curve on-chain. Graduated liquidity sits in DEX pools and is counted by those DEXs. Launched coins are not counted. TON curves are not included yet.',
  solana: { tvl: solanaTvl },
}
Object.keys(EVM).forEach((chain) => { module.exports[chain] = { tvl: evmTvl } })
