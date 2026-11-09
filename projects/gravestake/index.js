const bs58 = require('bs58').default || require('bs58')
const { svm } = require('@defillama/sdk').chains

// GraveStake: no-code staking pools on Solana (NFT and fungible). Every stake is a StakePosition
// account of the program, which records the staked mint and amount. Reward vaults (rewards funded
// by pool creators) have no position, so they are not counted. The EVM deployments (same factory on
// 12 chains) have not created any pool yet.
const PROGRAM_ID = 'GRv7q7Tff1yEEwvuuBin9xySF35pk7Vc4sVyJLM9wSTK'

// sha256("account:StakePosition")[0..8]
const POSITION_DISCRIMINATOR = Buffer.from([78, 165, 30, 111, 171, 125, 11, 220])

// StakePosition (Anchor/borsh, after the 8-byte discriminator):
//   version u8, pool Pubkey, owner Pubkey, position_key Pubkey, asset_mint Pubkey, amount u64, ...
// position_key is the owner for a fungible position (one per user per pool) and the NFT / asset id
// otherwise, so position_key == owner selects the fungible stakes.
const SLICE = { offset: 41, length: 104 } // owner .. amount
const OWNER = 0
const POSITION_KEY = 32
const ASSET_MINT = 64
const AMOUNT = 96

// $DEADS, the SolanaDeads ecosystem token (GraveStake is a SolanaDeads product)
const DEADS = 'DEADsWJZaonaiZPFkrqEEBGf43mzA5uHeHpwgy9dW666'

// tvl and staking read the same accounts: fetch once per run
let cached = {}
function getFungiblePositions(api) {
  const key = `${api.chain}-${api.timestamp}`
  if (!cached[key]) cached = { [key]: fetchFungiblePositions(api.chain).catch((e) => { delete cached[key]; throw e }) }
  return cached[key]
}

async function fetchFungiblePositions(chain) {
  const accounts = await svm.getProgramAccounts({
    chain, programId: PROGRAM_ID, dataSlice: SLICE,
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(POSITION_DISCRIMINATOR) } }],
  })
  const positions = []
  for (const { account } of accounts) {
    const data = Buffer.from(account.data[0], 'base64')
    if (data.length !== SLICE.length) throw new Error('gravestake: unexpected StakePosition layout')
    if (!data.subarray(OWNER, OWNER + 32).equals(data.subarray(POSITION_KEY, POSITION_KEY + 32))) continue // NFT position
    positions.push({ mint: bs58.encode(data.subarray(ASSET_MINT, ASSET_MINT + 32)), amount: data.readBigUInt64LE(AMOUNT) })
  }
  return positions
}

async function tvl(api) {
  const positions = await getFungiblePositions(api)
  positions.filter(p => p.mint !== DEADS).forEach(p => api.add(p.mint, p.amount.toString()))
}

async function staking(api) {
  const positions = await getFungiblePositions(api)
  positions.filter(p => p.mint === DEADS).forEach(p => api.add(p.mint, p.amount.toString()))
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the fungible SPL and Token-2022 tokens users have staked in GraveStake pools, summed from the program\'s StakePosition accounts (staked mint and amount of each fungible position). $DEADS, the SolanaDeads ecosystem token, is reported under staking instead. Staked NFTs are not counted, and neither are reward vaults, because those hold rewards funded by pool creators, not user deposits.',
  solana: { tvl, staking },
}
