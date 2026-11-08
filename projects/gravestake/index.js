const { PublicKey } = require('@solana/web3.js')
const bs58 = require('bs58').default || require('bs58')
const { svm } = require('@defillama/sdk').chains
const { sumTokens2, getAssociatedTokenAddress } = require('../helper/solana')
const { sleep } = require('../helper/utils')

// GraveStake: no-code staking pools on Solana (NFT and fungible). Every token account the
// program creates is owned by the pool PDA, and comes in one of three kinds:
//   - stake escrow, fungible:  seeds ["escrow", pool, staker]     -> user deposits (counted)
//   - stake escrow, NFT/pNFT:  seeds ["escrow", pool, nft_mint]   -> NFTs (not counted)
//   - reward vault:            seeds ["vault",  pool, reward_mint] -> rewards funded by the pool creator (not counted)
// MPL Core and compressed NFTs are frozen in the owner's wallet and leave no token account.
// The EVM deployments (same factory on 12 chains) have not created any pool yet.
const PROGRAM_ID = new PublicKey('GRv7q7Tff1yEEwvuuBin9xySF35pk7Vc4sVyJLM9wSTK')

// sha256("account:Pool")[0..8]
const POOL_DISCRIMINATOR = Buffer.from([241, 154, 109, 4, 17, 177, 109, 188])

// $DEADS, the SolanaDeads ecosystem token (GraveStake is a SolanaDeads product)
const DEADS = 'DEADsWJZaonaiZPFkrqEEBGf43mzA5uHeHpwgy9dW666'

const pda = (seed, pool, mint) =>
  PublicKey.findProgramAddressSync([Buffer.from(seed), pool.toBuffer(), mint.toBuffer()], PROGRAM_ID)[0].toBase58()

// tvl and staking read the same accounts: fetch once per run
let cached = {}
function getFungibleEscrows(api) {
  const key = `${api.chain}-${api.timestamp}`
  if (!cached[key]) cached = { [key]: fetchFungibleEscrows(api.chain).catch((e) => { delete cached[key]; throw e }) }
  return cached[key]
}

async function fetchFungibleEscrows(chain) {
  const pools = await svm.getProgramAccounts({
    chain, programId: PROGRAM_ID.toBase58(),
    dataSlice: { offset: 0, length: 0 },
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(POOL_DISCRIMINATOR) } }],
  })
  const escrows = []
  // one request per pool and token program, through the sdk's rate limiter; an RPC failure
  // fails the run instead of silently dropping a pool
  for (const { pubkey } of pools) {
    const pool = new PublicKey(pubkey)
    for (const programId of [svm.TOKEN_PROGRAM_ID, svm.TOKEN_2022_PROGRAM_ID]) {
      const { value } = await svm.call({
        chain, method: 'getTokenAccountsByOwner',
        params: [pubkey, { programId }, { encoding: 'base64', dataSlice: { offset: 0, length: 32 } }],
      })
      for (const { pubkey: address, account } of value) {
        const mint = new PublicKey(Buffer.from(account.data[0], 'base64')) // first 32 bytes of an SPL / Token-2022 account
        if (address === pda('vault', pool, mint)) continue // creator-funded reward vault
        if (address === pda('escrow', pool, mint)) continue // NFT escrow
        if (address === getAssociatedTokenAddress(mint, pool, new PublicKey(programId))) continue // not a program escrow: anyone can open and fund the pool's ATA
        escrows.push({ address, mint: mint.toBase58() })
      }
      await sleep(300) // the public RPC caps getTokenAccountsByOwner per method
    }
  }
  return escrows
}

async function tvl(api) {
  const escrows = await getFungibleEscrows(api)
  const tokenAccounts = escrows.filter(e => e.mint !== DEADS).map(e => e.address)
  return sumTokens2({ api, tokenAccounts })
}

async function staking(api) {
  const escrows = await getFungibleEscrows(api)
  const tokenAccounts = escrows.filter(e => e.mint === DEADS).map(e => e.address)
  return sumTokens2({ api, tokenAccounts })
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the fungible SPL and Token-2022 tokens users have staked in GraveStake pools, read from each pool\'s stake escrow token accounts (PDA ["escrow", pool, staker], owned by the pool). $DEADS, the SolanaDeads ecosystem token, is reported under staking instead. Staked NFTs are not counted, and neither are reward vaults (PDA ["vault", pool, reward_mint]), because those hold rewards funded by pool creators, not user deposits.',
  solana: { tvl, staking },
}
