const { PublicKey } = require('@solana/web3.js')
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes')
const { getConnection, getMultipleAccounts, decodeAccount, sumTokens2 } = require('../helper/solana')
const { POSITION_V2_DISCRIMINATOR } = require('../helper/utils/solana/layouts/meteora-dlmm-layout')

// Alokumi Vault: one non-custodial vault PDA per Agent; it holds the idle tokens and owns the agent's Meteora DLMM positions
const VAULT_PROGRAM = new PublicKey('B2zdd56urxgCWBoUKiaot1wT68rX1uqQ5oor4CyFwMZY')
const DLMM_PROGRAM = new PublicKey('LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo')

const VAULT_DISCRIMINATOR = bs58.encode(Buffer.from('d308e82b02987577', 'hex'))
// VaultPosition ["vpos", vault, position]: one per live DLMM position of a vault, closed together with the position
const VAULT_POSITION_DISCRIMINATOR = bs58.encode(Buffer.from('7a6dc13f45945aed', 'hex'))
const VAULT_POSITION_VAULT_OFFSET = 10 // discriminator 8 + version 1 + bump 1
const DLMM_POSITION_OWNER_OFFSET = 40 // discriminator 8 + lb_pair 32
const BINS_PER_ARRAY = 70
const DLMM_POSITION_BASE_SIZE = 8120 // resized positions append 112 bytes per extra bin, liquidity share first
const DLMM_EXTRA_BIN_SIZE = 112

const readU128 = (data, offset) => data.readBigUInt64LE(offset) + (data.readBigUInt64LE(offset + 8) << 64n)

async function getVaults(connection) {
  const accounts = await connection.getProgramAccounts(VAULT_PROGRAM, {
    filters: [{ memcmp: { offset: 0, bytes: VAULT_DISCRIMINATOR } }],
    dataSlice: { offset: 0, length: 0 },
  })
  return accounts.map(({ pubkey }) => pubkey.toBase58())
}

async function getVaultPositions(connection) {
  const accounts = await connection.getProgramAccounts(VAULT_PROGRAM, {
    filters: [{ memcmp: { offset: 0, bytes: VAULT_POSITION_DISCRIMINATOR } }],
    dataSlice: { offset: VAULT_POSITION_VAULT_OFFSET, length: 64 }, // vault, position
  })
  return accounts.map(({ account }) => ({
    vault: new PublicKey(account.data.subarray(0, 32)).toBase58(),
    position: new PublicKey(account.data.subarray(32, 64)),
  }))
}

const binArrayKey = (lbPair, binId) => {
  const index = Buffer.alloc(8)
  index.writeBigInt64LE(BigInt(Math.floor(binId / BINS_PER_ARRAY)))
  return PublicKey.findProgramAddressSync([Buffer.from('bin_array'), lbPair.toBuffer(), index], DLMM_PROGRAM)[0].toBase58()
}

async function addDlmmPositions(api, vaultPositions) {
  const infos = await getMultipleAccounts(vaultPositions.map(i => i.position))
  const positions = []
  infos.forEach((info, i) => {
    if (!info || !info.owner.equals(DLMM_PROGRAM)) return
    if (!info.data.subarray(0, 8).equals(POSITION_V2_DISCRIMINATOR)) return
    // the DLMM position must still be owned by the vault that registered it
    if (new PublicKey(info.data.subarray(DLMM_POSITION_OWNER_OFFSET, DLMM_POSITION_OWNER_OFFSET + 32)).toBase58() !== vaultPositions[i].vault) return
    const position = decodeAccount('meteoraPosition', info)
    const shares = position.liquidityShares.map(share => BigInt(share.toString()))
    for (let offset = DLMM_POSITION_BASE_SIZE; offset < info.data.length; offset += DLMM_EXTRA_BIN_SIZE)
      shares.push(readU128(info.data, offset))
    positions.push({
      lbPair: position.lbPair,
      lower: Number(position.lowerBinId),
      upper: Number(position.upperBinId),
      shares,
    })
  })
  if (!positions.length) return

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

async function tvl(api) {
  const connection = getConnection(api.chain)
  const vaults = await getVaults(connection)
  const vaultPositions = await getVaultPositions(connection)
  await addDlmmPositions(api, vaultPositions)
  // idle tokens waiting in the vaults (deposits not yet deployed, withdrawn liquidity, claimed fees), Token and Token-2022
  return sumTokens2({ api, owners: vaults })
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: 'Counts the assets held by Alokumi Vaults (one non-custodial vault PDA of the Alokumi Vault program per Agent): idle token balances of the vaults plus the principal of the Meteora DLMM positions they own, valued from the pools\' on-chain state. Unclaimed fees and rewards, and the owners\' SOL rent/gas reserves, are excluded. The DLMM positions are also counted by Meteora.',
  solana: { tvl },
}
