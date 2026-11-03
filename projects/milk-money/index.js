const sdk = require('@defillama/sdk')
const { PublicKey } = require('@solana/web3.js')
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes')
const { getConnection, getMultipleAccounts, decodeAccount, sumTokens2 } = require('../helper/solana')
const { POSITION_V2_DISCRIMINATOR } = require('../helper/utils/solana/layouts/meteora-dlmm-layout')

// Milk Money runs concentrated-liquidity positions on Meteora DLMM from a set of protocol-owned wallets:
// guard vaults (program-guarded PDAs whose operator can only move funds into positions or to a pinned treasury),
// the agent wallets that trade new pairs, and the launch / sniper fleet. Treasury pools turn their fees into $MM
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
  // sniper fleet
  '88nkMXa9SVNXUTt3ZxFTaZJeXpjQ5P7YdTFViXYFESKw', 'AVAKhEMvKMBxv3QMuexacsrQyTGq6pM37tWAPrvqQee7',
  'E9xshAhJRkxffUQ3Xkz1eDHeAGswg6EaELqcFkNToLY', '6HbWQ8ffnCFEWzm1U7JLNfeRtjpa1Y8CEbX4BWJSeBmX',
  'FxKMjRxphRpBTGzD23qsLqMC75v5gqF9CCp4V4zMKW8U', '5kVThhbgky3v8u1zfmKBKs7wu3x3MtLiJzNFko9gB3F8',
  '2j4B69YJZv1kBgRXe9Jv1Y7xZj9CdZPgo3FfSzt2buz3', '6gGBtEGmZAjMy2tMNe3ySq33D82198TWvGNH37T7BhJc',
  'EkLeZ1mTdDG2tTSykg8AmQTFCugdmsgiqM1y731Y2B7W', 'B3dsYyimn9hk3a2efAnQTaA47x6F1p9nnLi8PbiPysPM',
  '5sak5ey9nu8Vv9LLiTTxxbQnFkAxcdzFZU5qgqenHGkr', 'FqBzGnvpwYAv3HRzqzCchEx3xwLuQAphWHA2Eo4FW39m',
  'FCCgJZwCBikC2ixzkkZ8h5PjCVPJVZqgFmJZ7RkPQA1s', 'G1bG8EM8GNyaPoHNbppdXaBQw9aYw8wQy4RQVSbnB35K',
  'MqqpUuFad5DXbeX3Md4yquHch2EZPwTURf8hvYxGm1i', 'DFmpa1LZywquvXaFPToJmu7TkpNpa7fqKr8LwhYLLPuL',
  // launch wallets
  '98rstbGaABBMGyXsLHGsuRRA266oV4d8ggD2tcHGWY35', '6ZNQhTTfiDvNFxQcFVJM33kn6d9Sq1YKf4KCdsB7Ps9B',
  'BpZsGMnSwvDTXmiijSyXdgEXmJMH1YTb2JTQxMvW5Dcf', 'AmmfnooFhPR2wkhq1anDZEddM9eN3is6cVe5CZRvKTPk',
  '3NDk6yAZTAib6QsKAE6kgF7rMea9i7PcHGm5C9qnkkMX', 'Azo6F9Mg5icJ7ogk1pWeDKjbZtbzwQUWbgkTzWoRFrBr',
  'AJMbGoAocEjuxFEXATvXxrAh1VzPzdXHtkmnYuxfZYry', 'GiAZGJEQf8n1TGTcPxRyF6BLGnh4RXTHXCjBckk925my',
  'F1pWuTFiKQ433qhLkvmeLQxdS5WqDFNkQ2kXPLJWzNB4', 'HGfby1w9doLGoU9d5xvFt8pFgMbjsErRcoddMEUehD24',
  '8bgGtqQLpkguaJk16QsNqb82Xi3jcNpnBFVfSQkPrNQ7', '5egFdzypuDkaGePZj7huLX53nKCE31ef7z4WjnhLnspT',
  'BSrSgpsQ4PTP9cXtapXU4tsMEDAipVzgszNFRu5NtqT1', '9Rm21xnXtMPqU3nq92q7KvcfGmZhcSC68JQV435bngfM',
  'DeRsvWskcKSYZr358h1ZLA2uzjGVNCDskGsBwgTq89FD', 'FBL2cqbXWCV2N8ytFRrcnoEpBaADySB71EwhZQTjfTQF',
  '5WmnXH5vACAs869PrSyiBnkUJXbTxY8sudJvuJGjrSBo', '7rZY4QPnXZbF3FUWDVrMs7mFbAp9zCgRqjfi7Kep8qPB',
  'FBTsQBNa11ywQ8XqKWctTRvXa7PJ4XokbBtigAcSkTzY', 'BoD4rkawpL9ZYeFYeYc4Rx7FzuNSXe7ZfwAgUKHsgz1Y',
  'jhU3n8oM4auHPpgJfWxiL87wwLuY6P8og7ZkQjho6qn', '5vJYB44boFABmRScVtccoPF3sGG3bprD1PkdzsdRX2A6',
  'GxH8x4BopU8V3koBGYKa4JmXT4rZms88i4uXa3Bevjbb', 'ARG52vV9iw7cGmRWLv7zJyRpseuyHNFQfUC9m4wWkzsJ',
  'rQwBoHyctjdSLoowg7UoWcnkV2MCgobRd7r9mySgRmU', 'Ab71UihnR8hGMKd3SwSq4bKv9GL4gmBAsjL5BnsHC3E9',
  'H86vYp5r7bL2TAGYnmvZ8noYX1yR9QK6UUVfAeArtfjf',
  // MMRUSH legs
  'FwBzxq1Ea8tRvikWVzp5tMUuL5iKKeAABmCqSbjxG47j', '9796JDcgeshKHZabQCe3H7wMkmPxZpBZXq5xNh6jnZYN',
  'DV2XWWjwawFAqTNFqXT8UmuxzQiAqbFKCZ6XBa83nFju', 'BWAL3C6gwnTQFhrbtFDx2V9goWpSeXRDpB5JZni7eSB7',
  'B7QEKYHDHqeRwb6GpGPMRpX56gria9sDVpkAaYyM81Fw', 'Gp5q7LKzp9Ayx6f6tMQusG3Kpv91Do7o6gmZP3MsGdKK',
  'Bj3ccDzAazGxgAdkSrG8MYbW9mWL7oTqJ9U2Dtiud1cT',
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
  await sdk.util.runInPromisePool({
    concurrency: 2,
    items: OWNERS,
    processor: async (owner) => {
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
  methodology: 'TVL is the principal of the Meteora DLMM positions owned by Milk Money\'s protocol wallets (guard vaults, agent wallets and the launch and sniper fleet), valued from the pools\' on-chain bin state; unclaimed fees are excluded. Staking is the $MM held in the staking pool\'s stake vault.',
  solana: {
    tvl,
    staking: () => sumTokens2({ tokenAccounts: [MM_STAKE_VAULT] }),
  },
}
