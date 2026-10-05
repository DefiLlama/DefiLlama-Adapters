const { PublicKey } = require('@solana/web3.js')
const { getConnection, getMultipleAccounts, decodeAccount, sumTokens2 } = require('../helper/solana')

const ORE = 'oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp'
const LIQ_PROGRAM = new PublicKey('Liq3oDHexZahwaAULHBnfe4JUoHtS8MBqiQoyQmguMU')
const DLMM_PROGRAM = new PublicKey('LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo')
// receives 10% of the SOL the ORE program sweeps from its treasury, forwards it to LIQ_AUTHORITY
const LIQ_MANAGER = 'Ag3AkRaEbqu3yEVibhEQsgEAxoLrC2MyEcxSEXRxfCuu'
// Liq program PDA that owns the Meteora DLMM positions and holds claimed fees
const LIQ_AUTHORITY = 'DJqfQWB8tZE6fzqWa8okncDh7ciTuD8QQKp1ssNETWee'
// Liq program accounts that stage wSOL before it is deployed into a position
const ALLOCATION_SIZE = 160

const BINS_PER_ARRAY = 70
const DLMM_POSITION_BASE_SIZE = 8120 // resized positions append 112 bytes per extra bin, liquidity share first
const DLMM_EXTRA_BIN_SIZE = 112

const readU128 = (data, offset) => data.readBigUInt64LE(offset) + (data.readBigUInt64LE(offset + 8) << 64n)

// fetches accounts and returns { key: decoded account }, skipping accounts that don't exist
async function getDecodedAccounts(keys, layout) {
  const infos = await getMultipleAccounts(keys)
  const decoded = {}
  keys.forEach((key, i) => {
    if (infos[i]) decoded[key] = decodeAccount(layout, infos[i])
  })
  return decoded
}

// bin arrays are PDAs of ["bin_array", lbPair, index], each covering BINS_PER_ARRAY bins
function getBinArrayKey(lbPair, binId) {
  const index = Buffer.alloc(8)
  index.writeBigInt64LE(BigInt(Math.floor(binId / BINS_PER_ARRAY)))
  const [key] = PublicKey.findProgramAddressSync([Buffer.from('bin_array'), lbPair.toBuffer(), index], DLMM_PROGRAM)
  return key.toBase58()
}

async function getPositions(owner) {
  const accounts = await getConnection().getProgramAccounts(DLMM_PROGRAM, {
    filters: [{ memcmp: { offset: 40, bytes: owner } }],
    dataSlice: { offset: 0, length: 0 },
  })
  const infos = await getMultipleAccounts(accounts.map(account => account.pubkey))
  return infos.filter(Boolean).map(info => {
    const position = decodeAccount('meteoraPosition', info)
    const shares = position.liquidityShares.map(share => BigInt(share.toString()))
    for (let offset = DLMM_POSITION_BASE_SIZE; offset < info.data.length; offset += DLMM_EXTRA_BIN_SIZE)
      shares.push(readU128(info.data, offset))
    return { lbPair: position.lbPair, lowerBinId: Number(position.lowerBinId), upperBinId: Number(position.upperBinId), shares }
  })
}

// yields each bin of the position that holds liquidity, with the position's share in it
function* activeBins({ lowerBinId, upperBinId, shares }) {
  for (let binId = lowerBinId; binId <= upperBinId; binId++) {
    const share = shares[binId - lowerBinId]
    if (share > 0n) yield { binId, share }
  }
}

async function addDlmmPositions(api, owner, isOwnToken) {
  const positions = await getPositions(owner)

  const pairKeys = [...new Set(positions.map(position => position.lbPair.toBase58()))]
  const binArrayKeys = new Set()
  for (const position of positions)
    for (const { binId } of activeBins(position))
      binArrayKeys.add(getBinArrayKey(position.lbPair, binId))

  const pairs = await getDecodedAccounts(pairKeys, 'meteoraLbPair')
  const binArrays = await getDecodedAccounts([...binArrayKeys], 'meteoraBinArray')

  const addBalance = (mint, amount) => {
    if ((mint === ORE) === isOwnToken) api.add(mint, amount.toString())
  }

  for (const position of positions) {
    let amountX = 0n
    let amountY = 0n
    for (const { binId, share } of activeBins(position)) {
      const binArray = binArrays[getBinArrayKey(position.lbPair, binId)]
      if (!binArray) throw new Error(`Missing Meteora bin array for ${position.lbPair.toBase58()} bin ${binId}`)
      const bin = binArray.bins[binId - Number(binArray.index) * BINS_PER_ARRAY]
      const supply = BigInt(bin.liquiditySupply.toString())
      if (!supply) continue
      amountX += share * BigInt(bin.amountX.toString()) / supply
      amountY += share * BigInt(bin.amountY.toString()) / supply
    }
    const pair = pairs[position.lbPair.toBase58()]
    addBalance(pair.tokenXMint.toBase58(), amountX)
    addBalance(pair.tokenYMint.toBase58(), amountY)
  }
}

const balances = (isOwnToken) => async (api) => {
  await addDlmmPositions(api, LIQ_AUTHORITY, isOwnToken)
  if (isOwnToken) return sumTokens2({ api, owners: [LIQ_MANAGER, LIQ_AUTHORITY], tokens: [ORE] })
  const allocations = await getConnection(api.chain).getProgramAccounts(LIQ_PROGRAM, {
    filters: [{ dataSize: ALLOCATION_SIZE }],
    dataSlice: { offset: 0, length: 0 },
  })
  const owners = [LIQ_MANAGER, LIQ_AUTHORITY, ...allocations.map(a => a.pubkey.toBase58())]
  return sumTokens2({ api, owners, solOwners: [LIQ_MANAGER], blacklistedTokens: [ORE] })
}

module.exports = {
  timetravel: false,
  methodology: 'Counts ORE protocol-owned liquidity: the Meteora DLMM positions owned by the ORE Liq program, which the ORE treasury funds with 10% of the SOL it sweeps, plus the SOL and tokens its accounts hold before deployment. ORE on the protocol\'s side of the pools is reported as own tokens.',
  solana: {
    tvl: balances(false),
    ownTokens: balances(true),
  },
}
