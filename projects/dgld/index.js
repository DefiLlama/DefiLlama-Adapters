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
// NOTE: ethereum:0xA9299C296d7830A99414d1E5546F5171fA01E9c8 is not currently
// indexed by coins.llama.fi, so the Ethereum leg prices to 0. See the PR
// description. This comment can be removed once the token is indexed.

const { getTokenSupplies } = require('../helper/solana')

const DGLD_ETHEREUM = '0xA9299C296d7830A99414d1E5546F5171fA01E9c8'
const DGLD_BASE = '0xe908475f8Beb7A138B0dc6eb5A05cb27068ffB9A'
const DGLD_SOLANA = 'dg1dmo6NZNagkwB6EAfUeaco6CFXFLRhb1KCrsqXTVz'

async function ethereumTvl(api) {
  const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: DGLD_ETHEREUM })
  api.add(DGLD_ETHEREUM, totalSupply)
}

async function baseTvl(api) {
  const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: DGLD_BASE })
  api.add(DGLD_BASE, totalSupply)
}

async function solanaTvl(api) {
  await getTokenSupplies([DGLD_SOLANA], { api })
}

module.exports = {
  methodology: 'TVL is the total DGLD supply on each chain, priced in USD. Each DGLD token represents 1 fine troy ounce of allocated, audited gold held in Swiss custody. Every chain has its own dedicated, independently backed supply minted natively on that chain rather than bridged from Ethereum, so TVL is the sum of the supply on every chain.',
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
