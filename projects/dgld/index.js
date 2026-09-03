// DGLD (Digital Gold) — tokenized physical gold.
// 1 DGLD = 1 fine troy ounce of allocated, audited gold held in Swiss custody.
//
// TVL is the total supply on each chain, priced in USD.
//
// Every chain has its own dedicated, independently backed supply: gold is
// placed in the vault and minted natively on that chain. Nothing is bridged
// between chains, so summing the per-chain supplies does not double-count.
// The original Base contract (0xd02f50E1017F493ffFFa70c8fCf09e349e11d6c9) was a
// bridged mirror of the Ethereum supply; it has been fully burned down
// (totalSupply is 0) and replaced by the native-supply contract below.
//
// Pricing: the DGLD token addresses are not indexed by coins.llama.fi, so
// address-based pricing resolves to 0. Instead we price the decimal-normalized
// supply directly against the CoinGecko id `gold-token-sa-dgld-tokenized-gold`
// via api.addCGToken. DGLD is one-to-one (1 token = 1 fine oz) on every chain,
// so the same CoinGecko id prices all three legs.

const { getTokenSupplies } = require('../helper/solana')

const CG_ID = 'gold-token-sa-dgld-tokenized-gold'
const DGLD_ETHEREUM = '0xA9299C296d7830A99414d1E5546F5171fA01E9c8'
const DGLD_BASE = '0xe908475f8Beb7A138B0dc6eb5A05cb27068ffB9A'
const DGLD_SOLANA = 'dg1dmo6NZNagkwB6EAfUeaco6CFXFLRhb1KCrsqXTVz'
const DGLD_SOLANA_DECIMALS = 9 // fixed at mint creation; Token-2022 mint decimals are immutable

// Price the ERC-20 total supply via CoinGecko, normalized by the token's decimals.
async function erc20Tvl(api, target) {
  const [totalSupply, decimals] = await Promise.all([
    api.call({ abi: 'erc20:totalSupply', target }),
    api.call({ abi: 'erc20:decimals', target }),
  ])
  api.addCGToken(CG_ID, totalSupply / 10 ** decimals)
}

async function ethereumTvl(api) {
  await erc20Tvl(api, DGLD_ETHEREUM)
}

async function baseTvl(api) {
  await erc20Tvl(api, DGLD_BASE)
}

async function solanaTvl(api) {
  // Fetch the raw SPL supply WITHOUT passing `api` — doing so would add it keyed
  // by the mint address (which coins.llama.fi does not price, i.e. 0). Instead we
  // price the decimal-normalized amount against the same CoinGecko id.
  const supplies = await getTokenSupplies([DGLD_SOLANA])
  const supply = Number(supplies[DGLD_SOLANA] || 0) / 10 ** DGLD_SOLANA_DECIMALS
  api.addCGToken(CG_ID, supply)
}

module.exports = {
  methodology: 'TVL is the total DGLD supply on each chain, priced in USD. Each DGLD token represents 1 fine troy ounce of allocated, audited gold held in Swiss custody. Every chain has its own dedicated, independently backed supply minted natively on that chain rather than bridged from Ethereum, so TVL is the sum of the supply on every chain. Supplies are priced against the CoinGecko id gold-token-sa-dgld-tokenized-gold because the token addresses are not indexed by coins.llama.fi.',
  ethereum: {
    tvl: ethereumTvl,
  },
  base: {
    tvl: baseTvl,
  },
  solana: {
    tvl: solanaTvl,
  },
}
