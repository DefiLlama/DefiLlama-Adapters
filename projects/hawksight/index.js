const sdk = require('@defillama/sdk')
const { PublicKey } = require('@solana/web3.js')
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes')
const { getConnection, getMultipleAccounts, decodeAccount, sumTokens2 } = require('../helper/solana')
const { POSITION_V2_DISCRIMINATOR } = require('../helper/utils/solana/layouts/meteora-dlmm-layout')

const HAWKFI_PROGRAM = new PublicKey('FqGg2Y1FNxMiGd51Q6UETixQWkF5fB92MysbYogRJb3P')
const DLMM_PROGRAM = new PublicKey('LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo')

const USER_PDA_DISCRIMINATOR = bs58.encode(Buffer.from('9011f207136bad76', 'hex'))
const BINS_PER_ARRAY = 70
const DLMM_POSITION_BASE_SIZE = 8120 // resized positions append 112 bytes per extra bin, liquidity share first
const DLMM_EXTRA_BIN_SIZE = 112

const readU128 = (data, offset) => data.readBigUInt64LE(offset) + (data.readBigUInt64LE(offset + 8) << 64n)

async function getUserPdas(connection) {
  const accounts = await connection.getProgramAccounts(HAWKFI_PROGRAM, {
    filters: [{ dataSize: 752 }, { memcmp: { offset: 0, bytes: USER_PDA_DISCRIMINATOR } }],
    dataSlice: { offset: 0, length: 0 },
  })
  return accounts.map(({ pubkey }) => pubkey.toBase58())
}

async function tvl(api) {
  const connection = getConnection(api.chain)
  const ownerSet = new Set(await getUserPdas(connection))
  // no dataSize filter: resized positions are larger than the base PositionV2 account
  // the scan is sharded by the owner's first byte, a single scan over all positions exceeds the RPC's scan limit
  const positionKeys = []
  await sdk.util.runInPromisePool({
    concurrency: 3,
    items: [...Array(256).keys()],
    processor: async (ownerByte) => {
      const rows = await connection.getProgramAccounts(DLMM_PROGRAM, {
        filters: [
          { memcmp: { offset: 0, bytes: bs58.encode(POSITION_V2_DISCRIMINATOR) } },
          { memcmp: { offset: 40, bytes: bs58.encode(Buffer.from([ownerByte])) } },
        ],
        dataSlice: { offset: 40, length: 32 },
      })
      rows.forEach(({ pubkey, account }) => { if (ownerSet.has(new PublicKey(account.data).toBase58())) positionKeys.push(pubkey) })
    },
  })

  const positions = (await getMultipleAccounts(positionKeys)).filter(Boolean).map(info => {
    const position = decodeAccount('meteoraPosition', info)
    const shares = position.liquidityShares.map(share => BigInt(share.toString()))
    for (let offset = DLMM_POSITION_BASE_SIZE; offset < info.data.length; offset += DLMM_EXTRA_BIN_SIZE)
      shares.push(readU128(info.data, offset))
    return { lbPair: position.lbPair, lower: Number(position.lowerBinId), upper: Number(position.upperBinId), shares }
  })

  const binArrayKey = (lbPair, binId) => {
    const index = Buffer.alloc(8)
    index.writeBigInt64LE(BigInt(Math.floor(binId / BINS_PER_ARRAY)))
    return PublicKey.findProgramAddressSync([Buffer.from('bin_array'), lbPair.toBuffer(), index], DLMM_PROGRAM)[0].toBase58()
  }

  const pairKeys = [...new Set(positions.map(p => p.lbPair.toBase58()))]
  const binArrayKeys = new Set()
  for (const { lbPair, lower, upper, shares } of positions)
    for (let binId = lower; binId <= upper; binId++)
      if (shares[binId - lower] > 0n) binArrayKeys.add(binArrayKey(lbPair, binId))
  const binArrayList = [...binArrayKeys]

  const pairs = {}
  ;(await getMultipleAccounts(pairKeys)).forEach((info, i) => pairs[pairKeys[i]] = decodeAccount('meteoraLbPair', info))
  const binArrays = {}
  ;(await getMultipleAccounts(binArrayList)).forEach((info, i) => { if (info) binArrays[binArrayList[i]] = decodeAccount('meteoraBinArray', info) })

  for (const { lbPair, lower, upper, shares } of positions) {
    const pair = pairs[lbPair.toBase58()]
    let amountX = 0n
    let amountY = 0n
    for (let binId = lower; binId <= upper; binId++) {
      const share = shares[binId - lower]
      if (!share) continue
      const binArray = binArrays[binArrayKey(lbPair, binId)]
      if (!binArray) throw new Error(`Missing Meteora bin array for ${lbPair.toBase58()} bin ${binId}`)
      const bin = binArray.bins[binId - Number(binArray.index) * BINS_PER_ARRAY]
      const supply = BigInt(bin.liquiditySupply.toString())
      if (!supply) continue
      amountX += share * BigInt(bin.amountX.toString()) / supply
      amountY += share * BigInt(bin.amountY.toString()) / supply
    }
    api.add(pair.tokenXMint.toBase58(), amountX.toString())
    api.add(pair.tokenYMint.toBase58(), amountY.toString())
  }
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  isHeavyProtocol: true,
  methodology: 'Counts the principal of Meteora DLMM positions owned by HawkFi user accounts (PDAs of the HawkFi program), valued from the pools\' on-chain state. Unclaimed fees and rewards are excluded. HawkFi-managed Orca Whirlpool positions are not included. These positions are also counted by Meteora.',
  solana: {
    tvl,
    staking: () => sumTokens2({ tokenAccounts: ['2eFeetCpZJprr67F2dToT52BbSkdeqKZT6hmVdVG14eU'] }),
  },
}
