const sdk = require('@defillama/sdk')
const { PublicKey } = require('@solana/web3.js')
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes')
const { getConnection, getMultipleAccounts, decodeAccount, sumTokens2 } = require('../helper/solana')
const { POSITION_V2_DISCRIMINATOR } = require('../helper/utils/solana/layouts/meteora-dlmm-layout')

// Milk Money runs concentrated-liquidity positions on Meteora DLMM from a set of protocol-owned wallets:
// guard vaults (program-guarded PDAs whose operator can only move funds into positions or to a pinned treasury),
// the agent wallets that trade new pairs. Treasury pools turn their fees into $MM
// buybacks; reward pools pay their fees to $MM stakers.
const OWNERS = [
  // guard vaults
  '2joLmenK3iX1Z2oanQLCtezwAnjhihyJN9JRDiQnJdDi', // core vault
  'EaXdaBNg4eZ1ErJKwhxn6GFrhxPqdrc3yR2DaunPoYek', // rewards vault (fees to stakers)
  'ZUyyNQfMKJSF2T7BD9SHdqV9KARshimHBQgK74kZoiY',  // volume vault
  'CL5qyfZ5fhfKDrnwnnBt1uAtzcazczUSq9NYWmpEwSFa', // revenue vault
  '6bq9FFtjKr1djQop7jT5gGE7KKxopUUsmbxYVxXZknwF', // centering vault
  // agents
  '8tdfeokyWnNo7DqVp6DxYEXb4DX5Yy8jFE4zVA4PgLCj', '5DXzW87LWFScko1TeVrD1BKyoUUNYgoQC56JeBU3nBQV',
  'GqAWG8Md3KiRy6cUNhU9YYuE2hZvXo7NZDpbGxcBWkJn', 'dDQJgFpoFeUBrx9Nd6dojFDCQ8md47TCqJWTRzmrfmL',
  'BEdFPovfLGQkCCVrEys5V28YH8QfDXnKpAXJvwpEBqU7', 'F3o6pmCYgYFYs2u6AMvpL7PScUYKaiiUjtvrUejVHc1w',
]

// the $MM staking pool's stake vault (token account): staked $MM, reported separately from TVL
const MM_STAKE_VAULT = 'CYTyr6G2FVffSXR5kArtXGaGAKQu9NTKLfXTMbiNBJ2t'

const DLMM_PROGRAM = new PublicKey('LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo')
const BINS_PER_ARRAY = 70
const DLMM_POSITION_BASE_SIZE = 8120 // resized positions append 112 bytes per extra bin, liquidity share first
const DLMM_EXTRA_BIN_SIZE = 112
const readU128 = (data, offset) => data.readBigUInt64LE(offset) + (data.readBigUInt64LE(offset + 8) << 64n)

async function tvl(api) {
  const connection = getConnection(api.chain)
  // every DLMM PositionV2 owned by one of the protocol wallets (owner sits at offset 40, after the lbPair);
  // no dataSize filter because resized positions are larger than the base account
  const positionKeys = []
  // one owner-filtered scan per wallet, one at a time three seconds apart: the public RPC caps getProgramAccounts hard
  await sdk.util.runInPromisePool({
    concurrency: 1,
    items: OWNERS,
    processor: async (owner) => {
      await new Promise(resolve => setTimeout(resolve, 3000))
      const rows = await connection.getProgramAccounts(DLMM_PROGRAM, {
        filters: [
          { memcmp: { offset: 0, bytes: bs58.encode(POSITION_V2_DISCRIMINATOR) } },
          { memcmp: { offset: 40, bytes: owner } },
        ],
        dataSlice: { offset: 0, length: 0 },
      })
      rows.forEach(({ pubkey }) => positionKeys.push(pubkey))
    },
  })
  if (!positionKeys.length) return

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

  // a position's share of each bin's reserves; principal only, unclaimed fees are left out
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
  doublecounted: true, // the liquidity sits in Meteora DLMM pools, which DefiLlama already counts
  isHeavyProtocol: true, // one owner-filtered position scan per protocol wallet
  methodology: 'TVL is the principal of the Meteora DLMM positions owned by Milk Money\'s protocol wallets (guard vaults and agent wallets), valued from the pools\' on-chain bin state; unclaimed fees are excluded. Staking is the $MM held in the staking pool\'s stake vault.',
  solana: {
    tvl,
    staking: () => sumTokens2({ tokenAccounts: [MM_STAKE_VAULT] }),
  },
}
